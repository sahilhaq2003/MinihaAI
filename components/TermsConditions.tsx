import React from 'react';
import { ArrowLeft, FileCheck } from 'lucide-react';
import { Button } from './Button';

interface TermsConditionsProps {
  onBack: () => void;
}

export const TermsConditions: React.FC<TermsConditionsProps> = ({ onBack }) => {
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
              <FileCheck className="w-6 h-6 text-rose-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Terms and Conditions</h1>
          </div>

          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 mb-6">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <p className="text-slate-700 leading-relaxed mb-6">
              Welcome to <strong>MinihaAI</strong>. These Terms and Conditions govern your use of our website and the AI text humanization and detection services we provide. By accessing and using our website and services, you agree to comply with these terms. Please read them carefully before using our services.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Use of the Website</h2>
            <div className="space-y-3 mb-6 text-slate-700">
              <p><strong>a.</strong> You must be at least <strong>18 years old</strong> to use our website or subscribe to our services.</p>
              <p><strong>b.</strong> You are responsible for maintaining the confidentiality of your account information, including your username and password.</p>
              <p><strong>c.</strong> You agree to provide accurate and current information during the registration and subscription process.</p>
              <p><strong>d.</strong> You may not use our website for any unlawful or unauthorized purposes, including but not limited to:</p>
              <ul className="list-disc pl-8 mt-2 space-y-1">
                <li>Violating any applicable laws or regulations</li>
                <li>Infringing on intellectual property rights</li>
                <li>Transmitting malicious code or harmful content</li>
                <li>Attempting to gain unauthorized access to our systems</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Service Description</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              MinihaAI provides AI-powered text humanization and AI content detection services. Our services include:
            </p>
            <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
              <li><strong>Text Humanization:</strong> Transforming AI-generated text into natural, human-like writing with customizable tones and vocabulary levels</li>
              <li><strong>AI Detection:</strong> Analyzing text to determine the probability of AI generation and identifying potential AI models</li>
              <li><strong>Free Tier:</strong> Limited daily usage (10 humanizations, 3 detections) with standard tone only</li>
              <li><strong>Pro Plan:</strong> Unlimited usage with access to all 7 tones, advanced vocabulary levels, and priority processing</li>
            </ul>
            <p className="text-slate-700 leading-relaxed mb-6">
              We strive to provide accurate and reliable services, but we do not guarantee 100% accuracy in AI detection or humanization results, that humanized text will pass all AI detection systems, or uninterrupted or error-free service availability.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Subscriptions and Payments</h2>
            <div className="space-y-3 mb-6 text-slate-700">
              <p><strong>a.</strong> By subscribing to our premium service (Pro Plan), you agree to pay the subscription fee of $5.00 USD (LKR 1,500) as displayed at the time of purchase.</p>
              <p><strong>b.</strong> Payment is processed through manual bank transfer via QR code. After making payment, you must submit your payment transaction ID and mobile number for verification.</p>
              <p><strong>c.</strong> Subscription activation is subject to manual verification by our admin team. Your Pro plan will be activated within 24 hours after payment verification.</p>
              <p><strong>d.</strong> Subscriptions are valid for 30 days from the date of activation and do not automatically renew. You must make a new payment to continue your subscription after expiration.</p>
              <p><strong>e.</strong> We reserve the right to refuse or cancel any subscription for any reason, including but not limited to suspected fraudulent activity, invalid payment information, or violation of these terms.</p>
              <p><strong>f.</strong> All payments are final. We do not offer refunds for subscription payments once the Pro plan has been activated.</p>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">User Content and Privacy</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              When you use our services:
            </p>
            <ul className="list-disc pl-6 mb-6 text-slate-700 space-y-2">
              <li>You retain full ownership of all text content you submit for humanization or detection</li>
              <li>We do not store, retain, or use your text content for any purpose after processing</li>
              <li>Your content is processed in real-time and immediately discarded after generating results</li>
              <li>We do not use your content to train AI models or share it with third parties</li>
              <li>You are responsible for ensuring you have the right to submit any content you provide</li>
              <li>You agree not to submit content that is illegal, harmful, defamatory, or violates any third-party rights</li>
              <li>We reserve the right to refuse processing of content that violates these terms</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Account Registration</h2>
            <div className="space-y-3 mb-6 text-slate-700">
              <p><strong>a.</strong> To use our services, you must create an account by providing a valid email address and password.</p>
              <p><strong>b.</strong> You are responsible for maintaining the security of your account credentials and for all activities that occur under your account.</p>
              <p><strong>c.</strong> You must provide accurate and complete information during registration and keep your account information updated.</p>
              <p><strong>d.</strong> You may not share your account credentials with others or allow unauthorized access to your account.</p>
              <p><strong>e.</strong> We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.</p>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Intellectual Property</h2>
            <div className="space-y-3 mb-6 text-slate-700">
              <p><strong>a.</strong> All content and materials on our website, including but not limited to text, images, logos, graphics, and software, are protected by intellectual property rights and are the property of MinihaAI or its licensors.</p>
              <p><strong>b.</strong> You may not use, reproduce, distribute, or modify any content from our website without our prior written consent.</p>
              <p><strong>c.</strong> The MinihaAI name, logo, and related marks are trademarks of MinihaAI.</p>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Limitation of Liability</h2>
            <div className="space-y-3 mb-6 text-slate-700">
              <p><strong>a.</strong> In no event shall MinihaAI, its directors, employees, or affiliates be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in connection with your use of our website or services.</p>
              <p><strong>b.</strong> We make no warranties or representations, express or implied, regarding the quality, accuracy, or suitability of our services.</p>
              <p><strong>c.</strong> Our services are provided "as is" without warranty of any kind, either express or implied.</p>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Indemnification</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              You agree to indemnify and hold harmless MinihaAI, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising out of or related to your use of our services or violation of these Terms and Conditions.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Amendments and Termination</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We reserve the right to modify, update, or terminate these Terms and Conditions at any time without prior notice. It is your responsibility to review these terms periodically for any changes. We may also terminate or suspend your account and access to our services at our sole discretion, without prior notice, for conduct that we believe violates these Terms and Conditions or is harmful to other users, us, or third parties.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Governing Law</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              These Terms and Conditions shall be governed by and construed in accordance with the laws of the jurisdiction in which MinihaAI operates, without regard to its conflict of law provisions.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Contact Us</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              If you have any questions or concerns regarding these Terms and Conditions, please contact us at <a href="mailto:support@minihaai.com" className="text-rose-600 hover:text-rose-700 font-medium">support@minihaai.com</a>.
            </p>

            <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-sm text-slate-600 italic">
                <strong>Note:</strong> These Terms and Conditions are subject to change. We encourage you to review these terms periodically to stay informed about our policies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

