import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

async function fetchAndFormatTeamMembers(projectIds: string[]) {
  if (projectIds.length === 0) {
    return [];
  }

  // Get all team members from these projects
  const teamMemberRecords = await db.teamMember.findMany({
    where: {
      projectId: { in: projectIds }
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        }
      }
    }
  });

  // Extract unique users
  const uniqueUsersMap = new Map();
  teamMemberRecords.forEach(tm => {
    if (!uniqueUsersMap.has(tm.user.id)) {
      uniqueUsersMap.set(tm.user.id, tm.user);
    }
  });

  const teamMembers = Array.from(uniqueUsersMap.values());

  // Format the data to match the expected structure in TeamSidebar
  const formattedMembers = teamMembers.map(member => ({
    id: member.id,
    name: member.name || member.email?.split('@')[0] || 'Unknown User',
    status: 'online', // Default status, could be enhanced with real-time presence later
    image: member.image || null,
    initial: member.name?.charAt(0)?.toUpperCase() ||
             member.email?.charAt(0)?.toUpperCase() ||
             'U'
  }));

  return formattedMembers;
}

export async function GET(request: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the project IDs where the current user is a member
    const userProjects = await db.teamMember.findMany({
      where: {
        userId: session.user.id as string,
      },
      select: {
        projectId: true,
      }
    });

// Extract project IDs
    const projectIds = userProjects.map(up => up.projectId);
    
    // Use the shared helper to fetch and format team members
    const formattedMembers = await fetchAndFormatTeamMembers(projectIds);

    return new Response(JSON.stringify(formattedMembers), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch team members' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Add POST method to allow specifying project context
export async function POST(request: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Parse request body to potentially filter by specific project
    let body;
    let projectId;
    try {
      body = await request.json();
      projectId = body?.projectId;
    } catch (error) {
      // Handle JSON parsing errors (malformed/empty JSON)
      if (error instanceof SyntaxError) {
        return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      // Re-throw other errors to be caught by outer catch block
      throw error;
    }

    let projectIds: string[];
    
    if (projectId) {
      // Verify that the user has access to this specific project
      const userProject = await db.teamMember.findFirst({
        where: {
          userId: session.user.id as string,
          projectId: projectId,
        },
        select: {
          projectId: true,
        }
      });

      if (!userProject) {
        return new Response(JSON.stringify({ error: 'Access denied to this project' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      projectIds = [projectId];
    } else {
      // Get all projects the user belongs to
      const userProjects = await db.teamMember.findMany({
        where: {
          userId: session.user.id as string,
        },
        select: {
          projectId: true,
        }
      });

      projectIds = userProjects.map(up => up.projectId);
    }
    
    // Use the shared helper to fetch and format team members
    const formattedMembers = await fetchAndFormatTeamMembers(projectIds);

    return new Response(JSON.stringify(formattedMembers), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch team members' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}