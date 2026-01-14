'use client'
import React from "react";
import { motion } from "framer-motion";
import EnhancedNavbar from "@/components/EnhancedNavbar";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <>
      <EnhancedNavbar />
      <div 
        className="relative min-h-screen pt-16 bg-white"
      >
        <div className="relative z-10 px-6 md:px-16 lg:px-32 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Page Title */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                  Legal Policies
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600">
                Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </motion.div>

            {/* Privacy Policy Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h2>
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-4">
                <p>
                  GirlsWhoGive is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our donation-tracking platform.
                </p>

                <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Information We Collect</h3>
                <p>
                  We collect information that you provide directly to us, including:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Account information (name, email address, role)</li>
                  <li>Organization details (name, address, contact information, tax ID)</li>
                  <li>Donation information (items donated, quantities, dates)</li>
                  <li>Communication preferences</li>
                </ul>

                <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">How We Use Your Information</h3>
                <p>
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process and track donations</li>
                  <li>Connect donors with organizations</li>
                  <li>Send you updates and communications related to our services</li>
                  <li>Respond to your inquiries and provide customer support</li>
                  <li>Comply with legal obligations</li>
                </ul>

                <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Information Sharing and Disclosure</h3>
                <p>
                  We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>With your consent</li>
                  <li>To facilitate donations between donors and organizations</li>
                  <li>To comply with legal obligations or respond to legal requests</li>
                  <li>To protect our rights, privacy, safety, or property</li>
                  <li>With service providers who assist us in operating our platform</li>
                </ul>

                <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Data Security</h3>
                <p>
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.
                </p>

                <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Your Rights</h3>
                <p>
                  You have the right to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access and receive a copy of your personal information</li>
                  <li>Correct inaccurate or incomplete information</li>
                  <li>Request deletion of your personal information</li>
                  <li>Object to or restrict processing of your information</li>
                  <li>Withdraw consent at any time</li>
                </ul>

                <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Cookies and Tracking Technologies</h3>
                <p>
                  We use cookies and similar tracking technologies to track activity on our platform and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                </p>

                <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Changes to This Privacy Policy</h3>
                <p>
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
                </p>

                <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Contact Us</h3>
                <p>
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <p className="mt-2">
                  <strong>Email:</strong> support@girlswhogive.org<br />
                  <strong>Phone:</strong> +1 (555) 123-4567
                </p>
              </div>
            </motion.div>

            {/* Terms of Use Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-12 pt-8 border-t border-gray-200"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Terms of Use</h2>
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-4">
                <p>
                  By accessing and using GirlsWhoGive, you accept and agree to be bound by the terms and provision of this agreement.
                </p>

                <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Use License</h3>
                <p>
                  Permission is granted to temporarily use GirlsWhoGive for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose or for any public display</li>
                  <li>Attempt to reverse engineer any software contained on the platform</li>
                  <li>Remove any copyright or other proprietary notations from the materials</li>
                </ul>

                <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">User Accounts</h3>
                <p>
                  You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
                </p>

                <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Prohibited Uses</h3>
                <p>
                  You may not use our platform:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>In any way that violates any applicable law or regulation</li>
                  <li>To transmit any malicious code or harmful content</li>
                  <li>To impersonate or attempt to impersonate another user or entity</li>
                  <li>To engage in any fraudulent or deceptive practices</li>
                </ul>

                <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Limitation of Liability</h3>
                <p>
                  In no event shall GirlsWhoGive or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on GirlsWhoGive.
                </p>
              </div>
            </motion.div>

            {/* Legal Disclaimer Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mb-12 pt-8 border-t border-gray-200"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Legal Disclaimer</h2>
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-4">
                <p>
                  The information on this platform is provided on an "as is" basis. To the fullest extent permitted by law, GirlsWhoGive:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Excludes all representations and warranties relating to this platform and its contents</li>
                  <li>Excludes all liability for damages arising out of or in connection with your use of this platform</li>
                  <li>Does not guarantee the accuracy, completeness, or timeliness of information provided</li>
                </ul>

                <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">No Warranty</h3>
                <p>
                  GirlsWhoGive makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                </p>

                <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Third-Party Links</h3>
                <p>
                  Our platform may contain links to third-party websites or services. We are not responsible for the content, privacy policies, or practices of any third-party sites or services.
                </p>
              </div>
            </motion.div>

            {/* Donation Policy Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mb-12 pt-8 border-t border-gray-200"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Donation Policy</h2>
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-4">
                <p>
                  GirlsWhoGive facilitates connections between donors and verified nonprofit organizations. By using our platform, you agree to the following donation policies:
                </p>

                <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Donor Responsibilities</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate information about items being donated</li>
                  <li>Ensure donated items are in good condition and meet the organization's needs</li>
                  <li>Deliver items as committed or notify the organization of any changes</li>
                  <li>Comply with all applicable laws and regulations regarding donations</li>
                </ul>

                <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Organization Responsibilities</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Maintain accurate records of received donations</li>
                  <li>Use donated items for their stated charitable purposes</li>
                  <li>Provide acknowledgment or receipts when requested</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>

                <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Tax Deductions</h3>
                <p>
                  GirlsWhoGive does not provide tax advice. Donors are responsible for determining the tax-deductible value of their donations and should consult with a tax professional. Organizations are responsible for providing appropriate documentation for tax purposes.
                </p>

                <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Donation Disputes</h3>
                <p>
                  In the event of a dispute between a donor and an organization, GirlsWhoGive will attempt to facilitate resolution but is not responsible for the outcome. We reserve the right to suspend or terminate accounts that violate our policies.
                </p>

                <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Verification</h3>
                <p>
                  Organizations listed on our platform are verified partners who have completed our registration process. However, GirlsWhoGive does not guarantee the ongoing compliance or legitimacy of any organization.
                </p>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="pt-8 border-t border-gray-200 text-center"
            >
              <p className="text-gray-600 mb-4">
                If you have any questions about these policies, please contact us:
              </p>
              <p className="text-gray-700">
                <strong>Email:</strong> support@girlswhogive.org<br />
                <strong>Phone:</strong> +1 (555) 123-4567
              </p>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PrivacyPolicy;


