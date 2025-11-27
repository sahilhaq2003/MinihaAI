import React from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { Button } from './Button';

interface ReturnPolicyProps {
  onBack: () => void;
}

export const ReturnPolicy: React.FC<ReturnPolicyProps> = ({ onBack }) => {
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
              <RotateCcw className="w-6 h-6 text-rose-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Return Policy</h1>
          </div>

          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 mb-6">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <p className="text-slate-700 leading-relaxed mb-6">
              Thank you for using <strong>MinihaAI</strong>. We value your satisfaction and strive to provide you with the best AI text humanization and detection experience possible. This Return Policy outlines the terms and conditions for returning subscriptions and requesting refunds.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Subscription Returns</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              Since MinihaAI provides digital services (AI text humanization and detection), we do not accept returns of subscriptions in the traditional sense. However, we offer refunds for subscription payments within <strong>7 days</strong> from the date of purchase, subject to the conditions outlined in our Refund Policy.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Eligibility for Refunds</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              To be eligible for a refund, you must meet the following conditions:
            </p>
            <ul className="list-disc pl-6 mb-6 text-slate-700 space-y-2">
              <li>The refund request is made within 7 days of the initial subscription payment</li>
              <li>You have not exceeded the free tier usage limits during the refund period</li>
              <li>The refund is not for a subscription that has been active for more than 7 days</li>
              <li>You have not violated our Terms and Conditions</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">How to Request a Refund</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              To request a refund, please follow these steps:
            </p>
            <ol className="list-decimal pl-6 mb-6 text-slate-700 space-y-2">
              <li>Contact our customer support team at <a href="mailto:support@minihaai.com" className="text-rose-600 hover:text-rose-700 font-medium">support@minihaai.com</a></li>
              <li>Provide your account email address and subscription details</li>
              <li>State the reason for your refund request</li>
              <li>Our team will review your request and respond within 2-3 business days</li>
            </ol>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Refund Processing</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              Once your refund request is approved:
            </p>
            <ul className="list-disc pl-6 mb-6 text-slate-700 space-y-2">
              <li>We will process the refund to your original payment method</li>
              <li>Refunds will be processed within 5-10 business days</li>
              <li>It may take additional time for the refund to appear in your account, depending on your payment provider</li>
              <li>Your subscription will be cancelled immediately upon refund approval</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Non-Refundable Items</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              The following are non-refundable:
            </p>
            <ul className="list-disc pl-6 mb-6 text-slate-700 space-y-2">
              <li>Subscriptions that have been active for more than 7 days</li>
              <li>Free tier usage (no payment made)</li>
              <li>Any promotional or discounted subscriptions that explicitly state "non-refundable"</li>
              <li>Subscriptions cancelled after the 7-day refund period</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Cancellation</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              You may cancel your subscription at any time through your account settings. Cancellation will take effect at the end of your current billing period. You will continue to have access to premium features until the end of your paid period. Cancellation does not automatically entitle you to a refund unless requested within the 7-day refund period.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Service Issues</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              If you experience technical issues or service problems:
            </p>
            <ul className="list-disc pl-6 mb-6 text-slate-700 space-y-2">
              <li>Please contact our support team immediately at <a href="mailto:support@minihaai.com" className="text-rose-600 hover:text-rose-700 font-medium">support@minihaai.com</a></li>
              <li>We will work to resolve the issue promptly</li>
              <li>If the issue cannot be resolved and significantly impacts your ability to use our services, we may offer a refund or service credit at our discretion</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Processing Time</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              Refund requests will be reviewed and processed within <strong>5-10 business days</strong> after we receive your request. Please note that it may take additional time for the refund to appear in your account, depending on your payment provider.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Contact Us</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              If you have any questions or concerns regarding our return policy or refund process, please contact our customer support team at <a href="mailto:support@minihaai.com" className="text-rose-600 hover:text-rose-700 font-medium">support@minihaai.com</a>. We are here to assist you and ensure your experience with MinihaAI is satisfactory.
            </p>

            <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-sm text-slate-600 italic">
                <strong>Note:</strong> This Return Policy is subject to change. We encourage you to review this policy periodically to stay informed about our return and refund practices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

