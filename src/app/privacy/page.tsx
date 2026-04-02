import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Learn how Olde Money Printing collects, uses, and protects your personal information.',
}

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-zinc-500">
          Last updated: March 10, 2026
        </p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-zinc-600">
        <section>
          <h2 className="text-lg font-semibold text-zinc-900">1. Introduction</h2>
          <p className="mt-2">
            Olde Money Printing (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting
            your privacy. This Privacy Policy explains how we collect, use, disclose, and
            safeguard your information when you visit our website and use our services. Please
            read this policy carefully. By using our services, you consent to the practices
            described in this policy.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">2. Information We Collect</h2>
          <p className="mt-2">We may collect the following types of information:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong className="text-zinc-900">Personal Information:</strong> Name, email
              address, phone number, shipping address, and billing information that you
              provide when creating an account, placing an order, or contacting us.
            </li>
            <li>
              <strong className="text-zinc-900">Account Information:</strong> If you sign in
              using a third-party service such as Google, we receive your name, email address,
              and profile picture as provided by that service.
            </li>
            <li>
              <strong className="text-zinc-900">Uploaded Content:</strong> Photos and images
              you upload for printing purposes.
            </li>
            <li>
              <strong className="text-zinc-900">Usage Data:</strong> Information about how
              you interact with our website, including pages visited, time spent on pages,
              browser type, and device information.
            </li>
            <li>
              <strong className="text-zinc-900">Cookies and Tracking:</strong> We use cookies
              and similar technologies to maintain your session, remember preferences, and
              improve your experience.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">3. How We Use Your Information</h2>
          <p className="mt-2">We use the information we collect to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Process and fulfill your print orders</li>
            <li>Create and manage your account</li>
            <li>Communicate with you about orders, services, and promotions</li>
            <li>Improve our website and services</li>
            <li>Comply with legal obligations</li>
            <li>Detect and prevent fraud or unauthorized activity</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">4. Information Sharing</h2>
          <p className="mt-2">
            We do not sell, trade, or rent your personal information to third parties. We may
            share your information with:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong className="text-zinc-900">Service Providers:</strong> Third-party
              companies that help us operate our business, such as payment processors,
              shipping carriers, and hosting providers.
            </li>
            <li>
              <strong className="text-zinc-900">Legal Requirements:</strong> When required by
              law, regulation, or legal process.
            </li>
            <li>
              <strong className="text-zinc-900">Business Transfers:</strong> In connection
              with a merger, acquisition, or sale of assets.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">5. Data Security</h2>
          <p className="mt-2">
            We implement reasonable administrative, technical, and physical security measures
            to protect your personal information. However, no method of transmission over the
            Internet or electronic storage is completely secure, and we cannot guarantee
            absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">6. Your Rights</h2>
          <p className="mt-2">Depending on your location, you may have the right to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your personal information</li>
            <li>Opt out of marketing communications</li>
            <li>Withdraw consent for data processing</li>
          </ul>
          <p className="mt-2">
            To exercise any of these rights, please contact us at{' '}
            <a
              href="mailto:hello@oldemoneyprintshop.com"
              className="text-zinc-900 underline transition-colors hover:text-zinc-600"
            >
              gallery@oldemoney.com
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">7. Third-Party Services</h2>
          <p className="mt-2">
            Our website may contain links to third-party websites or services. We are not
            responsible for the privacy practices of those third parties. We encourage you to
            review their privacy policies before providing any personal information.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">8. Children&apos;s Privacy</h2>
          <p className="mt-2">
            Our services are not intended for individuals under the age of 13. We do not
            knowingly collect personal information from children under 13. If we learn that
            we have collected such information, we will take steps to delete it promptly.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">9. Changes to This Policy</h2>
          <p className="mt-2">
            We may update this Privacy Policy from time to time. We will notify you of any
            material changes by posting the updated policy on this page with a revised
            &quot;Last updated&quot; date. Your continued use of our services after changes
            are posted constitutes your acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">10. Contact Us</h2>
          <p className="mt-2">
            If you have any questions about this Privacy Policy, please{' '}
            <Link
              href="/contact"
              className="text-zinc-900 underline transition-colors hover:text-zinc-600"
            >
              contact us
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  )
}
