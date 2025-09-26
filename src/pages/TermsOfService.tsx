import React from 'react';

const TermsOfService = () => (
  <div className="min-h-screen bg-black text-white py-12 px-4 flex items-start justify-center">
    <div className="w-full max-w-4xl">
      <div className="flex items-center justify-center mb-8">
        <img src="/tiketx-logo-text.png" alt="TiketX" className="h-10 w-auto opacity-90" />
      </div>
      <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-center">Terms of Service – TiketX</h1>
      <p className="text-center text-gray-300 mb-8">Last Updated: 24-September-2025</p>

      <div className="prose prose-invert max-w-none space-y-6">
        <p>
          Welcome to TiketX (“Company,” “we,” “our,” or “us”). These Terms of Service (“Terms”) constitute a legally binding agreement between you (“User,” “Creator,” or “Viewer”) and TiketX, governing your access to and use of the TiketX website, mobile application, and related services (collectively, the “Platform”).
        </p>
        <p>
          By accessing, registering for, or using the Platform in any manner, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree, you must immediately stop using the Platform.
        </p>

        <h2 className="text-2xl font-bold">1. Eligibility and User Obligations</h2>
        <p>1.1 You must be at least 18 years of age to use TiketX. By registering, you represent and warrant that you meet this requirement and have the legal capacity to enter into these Terms.</p>
        <p>1.2 Users agree to provide accurate, current, and complete information during account creation and ticket purchases. You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
        <p>1.3 You agree not to use the Platform for any unlawful, fraudulent, or unauthorized purpose, and to comply with all applicable laws and regulations while using the services.</p>

        <h2 className="text-2xl font-bold">2. Platform Services</h2>
        <p>2.1 TiketX provides an online platform that enables creators to submit and stream films (“Content”) and allows viewers to purchase tickets to access such Content.</p>
        <p>2.2 TiketX is a facilitator and does not control, verify, or guarantee the accuracy, quality, legality, or availability of any Content provided by creators. The relationship of Content consumption is strictly between the Creator and the Viewer.</p>
        <p>2.3 TiketX reserves the right to refuse service, remove Content, or suspend accounts if any activity is found to be in violation of these Terms or applicable laws.</p>

        <h2 className="text-2xl font-bold">3. Payments, Fees, and Refunds</h2>
        <p>3.1 All payments made for tickets, subscriptions, or services on TiketX are processed through trusted third-party payment gateways. By making a payment, you agree to the terms and conditions of such payment providers.</p>
        <p>3.2 TiketX may charge service fees or commissions on transactions, which will be communicated clearly at the time of purchase or agreement with creators.</p>
        <div>
          <p>3.3 Refunds will be processed only in cases of:</p>
          <ul className="list-disc pl-6">
            <li>Screening cancellation by the Creator.</li>
            <li>Verified technical failures preventing access to purchased Content.</li>
            <li>Duplicate or erroneous transactions (subject to investigation).</li>
          </ul>
          <p>Refunds are issued at the sole discretion of TiketX, and service fees may be non-refundable.</p>
        </div>

        <h2 className="text-2xl font-bold">4. Content Ownership and Licensing</h2>
        <p>4.1 Creators retain full ownership of their films and other Content uploaded to TiketX.</p>
        <p>4.2 By submitting Content, Creators grant TiketX a non-exclusive, royalty-free, worldwide, sublicensable, and transferable license to host, stream, display, and distribute the Content solely for the purpose of operating the Platform.</p>
        <div>
          <p>4.3 Creators represent and warrant that:</p>
          <ul className="list-disc pl-6">
            <li>They own or have secured all necessary rights, licenses, and permissions to the Content.</li>
            <li>The Content does not infringe upon the intellectual property or other rights of any third party.</li>
            <li>The Content complies with all applicable laws, including those relating to copyright and censorship in India.</li>
          </ul>
        </div>
        <p>4.4 TiketX disclaims all liability for Content ownership disputes. Responsibility for resolving copyright claims lies solely with the Creator.</p>

        <h2 className="text-2xl font-bold">5. Prohibited Conduct</h2>
        <p>You agree not to:</p>
        <ul className="list-disc pl-6">
          <li>Upload or distribute any Content that is illegal, obscene, pornographic, defamatory, hateful, infringing, or otherwise objectionable.</li>
          <li>Attempt to hack, disrupt, or reverse engineer the Platform or its systems.</li>
          <li>Circumvent ticketing mechanisms or engage in fraudulent payment activity.</li>
          <li>Harass, abuse, or harm other users, creators, or employees of TiketX.</li>
        </ul>
        <p>Violation of these rules may result in suspension, termination, and potential legal action.</p>

        <h2 className="text-2xl font-bold">6. Intellectual Property Rights</h2>
        <p>6.1 All rights, title, and interest in TiketX’s Platform, including trademarks, software, designs, and logos, are owned by TiketX or its licensors.</p>
        <p>6.2 Users may not copy, reproduce, distribute, modify, or create derivative works of TiketX’s intellectual property without prior written consent.</p>
        <p>6.3 Any unauthorized use of TiketX’s intellectual property will result in immediate termination of access and may lead to legal proceedings.</p>

        <h2 className="text-2xl font-bold">7. Limitation of Liability</h2>
        <p>7.1 The Platform is provided on an “as is” and “as available” basis. TiketX makes no warranties, express or implied, regarding uninterrupted access, error-free operation, or security of the Platform.</p>
        <p>7.2 To the maximum extent permitted by law, TiketX shall not be liable for:</p>
        <ul className="list-disc pl-6">
          <li>Losses arising from technical failures, downtime, or streaming interruptions.</li>
          <li>Copyright infringement or disputes relating to Creator Content.</li>
          <li>Financial losses, indirect damages, or data breaches caused by third-party providers.</li>
        </ul>
        <p>7.3 TiketX’s total liability, whether in contract, tort, or otherwise, shall not exceed the amount paid by you in the last 30 days for use of the Platform.</p>

        <h2 className="text-2xl font-bold">8. Indemnification</h2>
        <p>You agree to indemnify, defend, and hold harmless TiketX, its directors, employees, and affiliates from and against any claims, liabilities, damages, costs, and expenses arising out of:</p>
        <ul className="list-disc pl-6">
          <li>Your use or misuse of the Platform.</li>
          <li>Your uploaded or streamed Content.</li>
          <li>Any violation of these Terms or applicable laws.</li>
        </ul>

        <h2 className="text-2xl font-bold">9. Termination of Services</h2>
        <p>9.1 TiketX reserves the right to suspend or terminate your account and access to the Platform without notice if you violate these Terms, misuse the services, or engage in unlawful activity.</p>
        <p>9.2 Upon termination, all licenses and rights granted to you will immediately cease.</p>

        <h2 className="text-2xl font-bold">10. Governing Law and Jurisdiction</h2>
        <p>These Terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the competent courts located in Hyderabad, India.</p>

        <h2 className="text-2xl font-bold">11. Amendments</h2>
        <p>TiketX reserves the right to modify or update these Terms at any time. Changes will be notified by updating the “Last Updated” date on this page. Continued use of the Platform after such updates constitutes acceptance of the revised Terms.</p>

        <h2 className="text-2xl font-bold">12. Contact Information</h2>
        <p>
          TiketX Support Team<br/>
          Email: <a href="mailto:support@tiketx.in" className="underline">support@tiketx.in</a><br/>
          Phone/WhatsApp: <a href="tel:+919346224895" className="underline">+91-9346224895</a>
        </p>
      </div>
    </div>
  </div>
);

export default TermsOfService; 