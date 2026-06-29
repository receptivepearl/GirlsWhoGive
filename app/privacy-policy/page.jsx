'use client'
import React from "react";
import EnhancedNavbar from "@/components/EnhancedNavbar";
import Footer from "@/components/Footer";

const PrivacyPolicyPage = () => {
  return (
    <>
      <EnhancedNavbar />
      <div 
        className="relative min-h-screen pt-16"
        style={{
          backgroundImage: 'url(/background/BackgroundUI.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          minHeight: '100vh'
        }}
      >
        <div className="relative z-10 px-6 md:px-16 lg:px-32 py-20">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Privacy Policy
              </h1>
              <p className="text-lg text-gray-600">
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Content Container */}
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-pink-100">
              <div className="prose prose-lg max-w-none">
                {/* Legal Disclaimer Section */}
                <section className="mb-12">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Legal Disclaimer</h2>
                  
                  <div className="text-gray-700 leading-relaxed space-y-4">
                    <p>
                      This website is provided for general informational purposes only. Our organization accepts in‑kind donations (donated goods) and does not collect or process monetary donations through this website. Nothing on this site should be interpreted as a request for financial contributions.
                    </p>
                    <p>
                      All donated goods are accepted at the discretion of the organization. We do not assign monetary values to donated items. Donors are responsible for determining the fair market value of any goods they contribute and for consulting a qualified tax professional regarding potential deductions. Acceptance of donated goods does not guarantee tax‑deductible status.
                    </p>
                    <p>
                      We make reasonable efforts to ensure the accuracy of the information presented on this website, but we make no representations or warranties of any kind regarding completeness, reliability, or suitability. Any reliance on the information provided is at your own risk.
                    </p>
                    <p>
                      This website may contain links to external websites. We do not control or endorse these sites and are not responsible for their content, policies, or practices.
                    </p>
                    <p>
                      By using this website, you agree that the organization is not liable for any loss, damage, or inconvenience arising from your use of the site or participation in donation activities.
                    </p>
                  </div>
                </section>

                {/* Privacy Policy Section */}
                <section className="mb-12 border-t border-gray-200 pt-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h2>
                  
                  <div className="text-gray-700 leading-relaxed space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Information We Collect</h3>
                      <p className="mb-2">We may collect the following information when you interact with our website:</p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Name, email address, phone number, or other contact details submitted through forms</li>
                        <li>Information voluntarily provided when inquiring about donating goods</li>
                        <li>Non‑personal data such as browser type, device information, and general usage statistics</li>
                      </ul>
                      <p className="mt-3">
                        We do not collect or process credit card information or monetary payments.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">How We Use Your Information</h3>
                      <p className="mb-2">We use collected information to:</p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Respond to inquiries about donating goods</li>
                        <li>Coordinate donation drop‑offs or pickups</li>
                        <li>Provide updates about our programs (only if you opt in)</li>
                        <li>Improve our website and communication processes</li>
                      </ul>
                      <p className="mt-3">
                        We do not sell, rent, or share your personal information with third parties for marketing purposes.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">How We Protect Your Information</h3>
                      <p>
                        We take reasonable measures to safeguard your personal information. However, no method of online transmission is completely secure, and we cannot guarantee absolute protection.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Third‑Party Links</h3>
                      <p>
                        We are not responsible for the privacy practices or content of external websites linked from this site.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Children's Privacy</h3>
                      <p>
                        This website is not intended for children under 13. We do not knowingly collect personal information from minors.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Changes to This Policy</h3>
                      <p>
                        We may update this Privacy Policy at any time. Changes will be posted on this page with an updated revision date.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Contact Information</h3>
                      <p className="mb-2">For privacy-related questions, contact us at:</p>
                      <p>
                        <strong>Email:</strong> support@girlswhogive.org
                      </p>
                      <p>
                        <strong>Phone:</strong> +1 (555) 123-4567
                      </p>
                    </div>
                  </div>
                </section>

                {/* Terms of Use Section */}
                <section className="mb-12 border-t border-gray-200 pt-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Terms of Use</h2>
                  
                  <div className="text-gray-700 leading-relaxed space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Purpose of This Website</h3>
                      <p>
                        This website provides general information and facilitates communication regarding in‑kind (goods‑only) donations. We do not accept monetary donations through this website.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Use of Website Content</h3>
                      <p>
                        All content—including text, images, and graphics—is for informational purposes only. You may view or print content for personal, non‑commercial use. You may not reproduce, modify, or distribute content without written permission.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">User Responsibilities</h3>
                      <p className="mb-2">By using this website, you agree not to:</p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Use the site for unlawful or harmful purposes</li>
                        <li>Attempt unauthorized access to the website or its systems</li>
                        <li>Upload harmful code or malware</li>
                        <li>Provide false or misleading information</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Third‑Party Links</h3>
                      <p>
                        We are not responsible for the content or practices of external websites.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Disclaimer of Warranties</h3>
                      <p>
                        This website is provided "as is" without warranties of any kind. We do not guarantee accuracy or reliability.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Limitation of Liability</h3>
                      <p className="mb-2">We are not liable for any damages arising from:</p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Use of the website</li>
                        <li>Reliance on website content</li>
                        <li>Participation in donation activities</li>
                        <li>Technical issues or interruptions</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Changes to These Terms</h3>
                      <p>
                        We may update these Terms of Use at any time. Continued use of the website indicates acceptance of the updated terms.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Contact Information</h3>
                      <p className="mb-2">For questions about these terms, contact us at:</p>
                      <p>
                        <strong>Email:</strong> support@girlswhogive.org
                      </p>
                      <p>
                        <strong>Phone:</strong> +1 (555) 123-4567
                      </p>
                    </div>
                  </div>
                </section>

                {/* Donation Policy Section */}
                <section className="mb-12 border-t border-gray-200 pt-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Donation Policy</h2>
                  
                  <div className="text-gray-700 leading-relaxed space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Types of Donations We Accept</h3>
                      <p className="mb-2">We accept in‑kind donations such as:</p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Clothing</li>
                        <li>Household items</li>
                        <li>Food or hygiene supplies</li>
                        <li>School or office supplies</li>
                        <li>Equipment or tools</li>
                      </ul>
                      <p className="mt-3">
                        Items must be clean, safe, and in usable condition. We reserve the right to decline items that are unsafe, damaged, or unsuitable.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Monetary Donations</h3>
                      <p className="mb-2">We do not accept:</p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Cash</li>
                        <li>Checks</li>
                        <li>Credit card payments</li>
                        <li>Online monetary contributions</li>
                        <li>Electronic transfers</li>
                      </ul>
                      <p className="mt-3">
                        Any monetary donation attempts made through unauthorized platforms will not be processed.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Drop‑Off and Pickup</h3>
                      <p>
                        Donation arrangements must be coordinated with us directly. Instructions will be provided upon request.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Tax‑Deductible Status</h3>
                      <p>
                        We do not assign monetary values to donated goods. Donors are responsible for determining fair market value and consulting a tax professional.
                      </p>
                      <p className="mt-2">
                        If the organization is not IRS‑recognized as tax‑exempt, contributions may not be tax‑deductible.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Receipts</h3>
                      <p className="mb-2">Upon request, we may provide a general acknowledgment listing:</p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Date of donation</li>
                        <li>Description of items received</li>
                      </ul>
                      <p className="mt-3">
                        We do not provide appraisals.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Safety Standards</h3>
                      <p className="mb-2">We cannot accept:</p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Broken or unsafe items</li>
                        <li>Expired food or products</li>
                        <li>Hazardous materials</li>
                        <li>Items requiring repair</li>
                        <li>Items with mold, pests, or strong odors</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Changes to This Policy</h3>
                      <p>
                        We may revise this Donation Policy at any time. Updates will be posted on this page.
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PrivacyPolicyPage;

