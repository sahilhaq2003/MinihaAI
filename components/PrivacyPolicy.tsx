import React from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from './Button';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 border border-slate-200">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-rose-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Privacy Policy</h1>
          </div>

          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 mb-6">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <p className="text-slate-700 leading-relaxed mb-6">
              At <strong>MinihaAI</strong>, we are committed to protecting the privacy and security of our users' personal information. This Privacy Policy outlines how we collect, use, and safeguard your information when you visit or use our AI text humanization service. By using our website and services, you consent to the practices described in this policy.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Information We Collect</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              When you visit our website or use our services, we may collect certain information about you, including:
            </p>
            <ul className="list-disc pl-6 mb-6 text-slate-700 space-y-2">
              <li><strong>Personal identification information:</strong> Name, email address, and profile picture (if you sign up using Google authentication) provided voluntarily during registration</li>
              <li><strong>Payment and billing information:</strong> Necessary to process your subscription payments, including payment method details, which are securely handled by trusted third-party payment processors</li>
              <li><strong>Usage information:</strong> Text content you submit for humanization, detection results, and usage patterns to improve our services</li>
              <li><strong>Browsing information:</strong> IP address, browser type, device information, and cookies collected automatically using standard web technologies</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Use of Information</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We may use the collected information for the following purposes:
            </p>
            <ul className="list-disc pl-6 mb-6 text-slate-700 space-y-2">
              <li>To provide and improve our AI text humanization and detection services</li>
              <li>To process your subscription payments and manage your account</li>
              <li>To communicate with you regarding your account, provide customer support, and respond to inquiries</li>
              <li>To personalize your experience and present relevant features and recommendations</li>
              <li>To detect and prevent fraud, unauthorized activities, and abuse of our services</li>
              <li>To analyze usage patterns and improve our algorithms and service quality</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Data Security and Privacy</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We take your privacy seriously:
            </p>
            <ul className="list-disc pl-6 mb-6 text-slate-700 space-y-2">
              <li><strong>Text Content:</strong> We do not store or retain the text content you submit for humanization or detection after processing. Your content is processed in real-time and immediately discarded</li>
              <li><strong>No Training Data:</strong> We do not use your submitted text to train AI models or share it with third parties</li>
              <li><strong>Secure Storage:</strong> We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction</li>
              <li><strong>Encryption:</strong> All data transmission is encrypted using SSL/TLS protocols</li>
            </ul>
            <p className="text-slate-700 leading-relaxed mb-6">
              However, please be aware that no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Information Sharing</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We respect your privacy and do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:
            </p>
            <ul className="list-disc pl-6 mb-6 text-slate-700 space-y-2">
              <li><strong>Trusted service providers:</strong> We may share your information with third-party service providers who assist us in operating our website, processing payments, and delivering services. These providers are contractually obligated to handle your data securely and confidentially</li>
              <li><strong>Legal requirements:</strong> We may disclose your information if required to do so by law or in response to valid legal requests or orders</li>
              <li><strong>Business transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Cookies and Tracking Technologies</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We use cookies and similar technologies to enhance your browsing experience, analyze website traffic, and gather information about your preferences and interactions with our website. You have the option to disable cookies through your browser settings, but this may limit certain features and functionality of our website.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Your Rights</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 mb-6 text-slate-700 space-y-2">
              <li>Access and update your personal information through your account settings</li>
              <li>Request deletion of your account and associated data</li>
              <li>Opt-out of marketing communications</li>
              <li>Request a copy of your personal data</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Changes to the Privacy Policy</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We reserve the right to update or modify this Privacy Policy at any time. Any changes will be posted on this page with a revised "last updated" date. We encourage you to review this Privacy Policy periodically to stay informed about how we collect, use, and protect your information.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Contact Us</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              If you have any questions, concerns, or requests regarding our Privacy Policy or the handling of your personal information, please contact us at <a href="mailto:support@minihaai.com" className="text-rose-600 hover:text-rose-700 font-medium">support@minihaai.com</a>.
            </p>

            <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-sm text-slate-600 italic">
                <strong>Note:</strong> This Privacy Policy is subject to change. We encourage you to review this policy periodically to stay informed about our privacy practices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

