// Test
import type { Metadata } from 'next';
import { CONTACT_EMAIL } from '@/config/constants';

export const metadata: Metadata = {
  title: 'Privacy Policy | Nexus',
  description: 'Learn about how Nexus handles your data and privacy.'
};

const PrivacyPage = (): React.JSX.Element => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="mb-4"><strong>Last Updated:</strong> January 10, 2026</p>
            
            <p className="mb-6">
              Nexus ("us", "we", or "our") operates the Nexus platform (the "Service"). 
              This page informs you of our policies regarding the collection, use, and disclosure 
              of personal data when you use our Service and the choices you have associated 
              with that data.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Information Collection and Use</h2>
            <p className="mb-6">
              We collect several types of information for various purposes to provide and 
              improve our Service to you.
            </p>
            
            <h3 className="text-xl font-medium mt-6 mb-3">Personal Data</h3>
            <p className="mb-4">
              While using our Service, we may ask you to provide us with certain personally 
              identifiable information that can be used to contact or identify you ("Personal Data").
            </p>
            <p className="mb-6">
              Personal Data may include, but is not limited to:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Email address</li>
              <li>First name and last name</li>
              <li>Academic information (institution, program, degree level)</li>
              <li>Usage data and preferences</li>
            </ul>
            
            <h3 className="text-xl font-medium mt-6 mb-3">Usage Data</h3>
            <p className="mb-6">
              We may also collect information on how the Service is accessed and used 
              ("Usage Data"). This Usage Data may include information such as your 
              computer's Internet Protocol address (IP address), browser type, browser 
              version, the pages of our Service that you visit, the time and date of 
              your visit, the time spent on those pages, unique device identifiers 
              and other diagnostic data.
            </p>
            
            <h3 className="text-xl font-medium mt-6 mb-3">Tracking & Cookies Data</h3>
            <p className="mb-6">
              We use cookies and similar tracking technologies to track the activity
              on our Service and hold certain information. Cookies are files with
              small amount of data which may include an anonymous unique identifier.
              Cookies are sent to your browser from a website and stored on your device.
            </p>
            <p className="mb-6">
              We use both session cookies (temporary) and persistent cookies (permanent)
              for the following purposes:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Authentication cookies</strong> – To manage user sessions and authenticate logged-in users</li>
              <li><strong>Security cookies</strong> – To detect authentication attacks and protect user data</li>
              <li><strong>Preference cookies</strong> – To remember your preferences and settings</li>
              <li><strong>CSRF protection cookies</strong> – To prevent cross-site request forgery attacks</li>
              <li><strong>OAuth state cookies</strong> – To securely manage OAuth authentication flows</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Use of Data</h2>
            <p className="mb-6">
              Nexus uses the collected data for various purposes:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>To provide and maintain our Service</li>
              <li>To notify you about changes to our Service</li>
              <li>To allow you to participate in interactive features of our Service</li>
              <li>To provide customer support</li>
              <li>To monitor the usage of our Service</li>
              <li>To detect, prevent and address technical issues</li>
              <li>To provide personalized features and content</li>
              <li>To improve our AI-powered recommendations and assistance</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">AI Processing and Data Usage</h2>
            <p className="mb-6">
              We use artificial intelligence to enhance your experience with our Service. 
              When you interact with our AI features, we may process your inputs to provide 
              personalized recommendations, research assistance, and other intelligent features.
            </p>
            <p className="mb-6">
              We do not use your personal data or content to train our AI models without 
              your explicit consent. Any data used for improving our AI systems is 
              anonymized and aggregated to protect individual privacy.
            </p>
            <p className="mb-6">
              You have the right to opt-out of certain AI processing features through 
              your account settings.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Data Retention</h2>
            <p className="mb-6">
              We retain your personal data only for as long as necessary for the 
              purposes set out in this Privacy Policy. We will retain and use your 
              personal data to the extent necessary to comply with our legal obligations, 
              resolve disputes, and enforce our legal agreements and policies.
            </p>
            <p className="mb-6">
              For free-tier users, your chat history and related data may be retained 
              for up to 1 day. Premium users enjoy extended retention periods of up to 
              30 days for their data. You can manage your data retention preferences 
              in your account settings.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Transfer of Data</h2>
            <p className="mb-6">
              Your information, including Personal Data, may be transferred to — and 
              maintained on — computers located outside of your state, province, country 
              or other governmental jurisdiction where the data protection laws may 
              differ from those of your jurisdiction.
            </p>
            <p className="mb-6">
              If you are located outside United States and choose to provide information 
              to us, please note that we transfer the data, including Personal Data, 
              to United States and process it there.
            </p>
            <p className="mb-6">
              Your consent to this Privacy Policy followed by your submission of such 
              information represents your agreement to that transfer.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Disclosure of Data</h2>
            <h3 className="text-xl font-medium mt-6 mb-3">Legal Requirements</h3>
            <p className="mb-6">
              Nexus may disclose your Personal Data in the good faith belief that 
              such action is necessary to:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Comply with a legal obligation</li>
              <li>Protect and defend the rights or property of Nexus</li>
              <li>Prevent or investigate possible wrongdoing in connection with the Service</li>
              <li>Protect the personal safety of users of the Service or the public</li>
              <li>Protect against legal liability</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Security of Data</h2>
            <p className="mb-6">
              The security of your data is important to us, but remember that no method 
              of transmission over the Internet, or method of electronic storage is 100% 
              secure. While we strive to use commercially acceptable means to protect 
              your Personal Data, we cannot guarantee its absolute security.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Your Data Protection Rights</h2>
            <p className="mb-6">
              Depending on your location, you may have the following rights regarding
              your personal data:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>The right to access</strong> – You have the right to request copies of your personal data.</li>
              <li><strong>The right to rectification</strong> – You have the right to request that we correct any information you believe is inaccurate.</li>
              <li><strong>The right to erasure</strong> – You have the right to request that we erase your personal data under certain conditions.</li>
              <li><strong>The right to restrict processing</strong> – You have the right to request that we restrict the processing of your personal data.</li>
              <li><strong>The right to data portability</strong> – You have the right to request that we transfer the data that we have collected to another organization.</li>
              <li><strong>The right to object to processing</strong> – You have the right to object to our processing of your personal data.</li>
              <li><strong>The right to withdraw consent</strong> – You have the right to withdraw your consent where we rely on consent to process your personal data.</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">California Consumer Privacy Act (CCPA) Rights</h2>
            <p className="mb-6">
              Under the CCPA, California residents have specific rights regarding their personal information:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>The right to know</strong> – About personal information collected, disclosed, or sold.</li>
              <li><strong>The right to delete</strong> – Personal information collected from you.</li>
              <li><strong>The right to opt-out</strong> – Of the sale of personal information.</li>
              <li><strong>The right to non-discrimination</strong> – For exercising your CCPA rights.</li>
            </ul>
            <p className="mb-6">
              To exercise any of these rights, please contact us using the information provided below.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">General Data Protection Regulation (GDPR) Compliance</h2>
            <p className="mb-6">
              We are committed to ensuring that your personal data is processed lawfully, fairly, and transparently in accordance with the General Data Protection Regulation (GDPR).
            </p>
            <p className="mb-6">
              Our lawful basis for processing your personal data includes:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Consent</strong> – Where you have given clear consent for us to process your personal data for a specific purpose.</li>
              <li><strong>Contract</strong> – Where processing is necessary for the performance of a contract to which you are a party.</li>
              <li><strong>Legal obligation</strong> – Where processing is necessary for compliance with a legal obligation.</li>
              <li><strong>Vital interests</strong> – Where processing is necessary to protect someone's vital interests.</li>
              <li><strong>Legitimate interests</strong> – Where processing is necessary for our legitimate interests, provided these are not overridden by your fundamental rights and freedoms.</li>
            </ul>
            <p className="mb-6">
              If you wish to exercise any of your GDPR rights, please contact us using the information provided below.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Service Providers</h2>
            <p className="mb-6">
              We may employ third-party companies and individuals due to the following reasons:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>To facilitate our Service</li>
              <li>To provide the Service on our behalf</li>
              <li>To perform Service-related services</li>
              <li>To assist us in analyzing how our Service is used</li>
            </ul>
            <p className="mb-6">
              These third parties have access to your Personal Data only to perform 
              these tasks on our behalf and are obligated not to disclose or use it 
              for any other purpose.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Links to Other Sites</h2>
            <p className="mb-6">
              Our Service may contain links to other sites that are not operated by us. 
              If you click on a third party link, you will be directed to that third 
              party's site. We strongly advise you to review the Privacy Policy of every 
              site you visit. We have no control over and assume no responsibility for 
              the content, privacy policies or practices of any third party sites or services.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Children's Privacy</h2>
            <p className="mb-6">
              Our Service does not address anyone under the age of 18 ("Children"). We do 
              not knowingly collect personally identifiable information from anyone under 
              the age of 18. If you are a parent or guardian and you are aware that your 
              Child has provided us with Personal Data, please contact us. If we become 
              aware that we have collected Personal Data from children without verification 
              of parental consent, we take steps to remove that information from our servers.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Automated Decision-Making and Profiling</h2>
            <p className="mb-6">
              Our service may use automated decision-making and profiling to provide
              personalized experiences and recommendations. This includes AI-driven
              analysis of your usage patterns, preferences, and interactions to offer
              tailored suggestions and content.
            </p>
            <p className="mb-6">
              Under GDPR, you have the right not to be subject to a decision based
              solely on automated processing, including profiling, which produces legal
              effects concerning you or similarly significantly affects you. However,
              where such processing is necessary for entering into, or performance of,
              a contract between you and us, or where it is based on your explicit consent,
              we may carry out such processing provided we have implemented suitable measures
              to safeguard your rights and freedoms.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Changes to This Privacy Policy</h2>
            <p className="mb-6">
              We may update our Privacy Policy from time to time. We will notify you of
              any changes by posting the new Privacy Policy on this page. You are advised
              to review this Privacy Policy periodically for any changes. Changes to this
              Privacy Policy are effective when they are posted on this page.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
            <p className="mb-6">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
               <li>By email: {CONTACT_EMAIL}</li>
            </ul>
            
            <h3 className="text-xl font-medium mt-6 mb-3">Submitting Requests</h3>
            <p className="mb-6">
              To submit requests regarding your personal data (access, correction, deletion, etc.), please send a
              written request to the contact information provided above. We will respond to your request within
              30 days. If your request is particularly complex, we may take up to 60 days to respond, but we will
              inform you of any delay and the reasons for it.
            </p>
            <p className="mb-6">
              To verify your identity when processing your request, we may require additional information. This
              is to ensure that personal data is not disclosed to unauthorized individuals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
