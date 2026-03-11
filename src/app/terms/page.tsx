import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service | Olde Money Printshop',
  description:
    'Review the terms and conditions governing your use of Olde Money Printshop services.',
}

export default function TermsOfServicePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-3 text-sm text-zinc-500">
          Last updated: March 10, 2026
        </p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-zinc-600">
        <section>
          <h2 className="text-lg font-semibold text-zinc-900">1. Acceptance of Terms</h2>
          <p className="mt-2">
            By accessing or using the Olde Money Printshop website and services
            (&quot;Services&quot;), you agree to be bound by these Terms of Service
            (&quot;Terms&quot;). If you do not agree to these Terms, please do not use our
            Services.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">2. Use of Services</h2>
          <p className="mt-2">
            You may use our Services only for lawful purposes and in accordance with these
            Terms. You agree not to:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Use the Services in any way that violates applicable law or regulation</li>
            <li>Upload content that infringes on any intellectual property or proprietary rights</li>
            <li>Upload content that is unlawful, harmful, threatening, abusive, or otherwise objectionable</li>
            <li>Attempt to interfere with or disrupt the Services or servers</li>
            <li>Use automated means to access the Services without our express permission</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">3. Accounts</h2>
          <p className="mt-2">
            When you create an account, you are responsible for maintaining the confidentiality
            of your credentials and for all activities that occur under your account. You agree
            to notify us immediately of any unauthorized use of your account. We reserve the
            right to suspend or terminate accounts that violate these Terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">4. User Content</h2>
          <p className="mt-2">
            You retain ownership of any images and content you upload to our Services. By
            uploading content, you grant us a limited, non-exclusive license to use, process,
            and store your content solely for the purpose of fulfilling your print orders and
            providing our Services. We will not use your uploaded content for any other purpose
            without your consent.
          </p>
          <p className="mt-2">
            You represent and warrant that you own or have the necessary rights to the content
            you upload, and that your content does not infringe on the rights of any third
            party.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">5. Orders and Payment</h2>
          <p className="mt-2">
            All orders placed through our Services are subject to acceptance and availability.
            Prices are subject to change without notice. We reserve the right to refuse or
            cancel any order for any reason, including errors in pricing or product
            information.
          </p>
          <p className="mt-2">
            Payment is required at the time of order. We accept the payment methods listed on
            our website. You agree to provide accurate and complete payment information.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">6. Shipping and Delivery</h2>
          <p className="mt-2">
            Delivery times are estimates and are not guaranteed. We are not responsible for
            delays caused by shipping carriers or circumstances beyond our control. Risk of
            loss and title for items purchased pass to you upon delivery to the carrier.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">7. Returns and Refunds</h2>
          <p className="mt-2">
            Because our products are custom-made to your specifications, we generally do not
            accept returns. However, if your order arrives damaged or contains a defect caused
            by our production process, please contact us within 14 days of delivery and we
            will work with you to resolve the issue, which may include a reprint or refund at
            our discretion.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">8. Intellectual Property</h2>
          <p className="mt-2">
            All content, trademarks, logos, and other intellectual property on our website are
            owned by or licensed to Olde Money Printshop. You may not reproduce, distribute,
            or create derivative works from any of our intellectual property without our
            written permission.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">9. Limitation of Liability</h2>
          <p className="mt-2">
            To the fullest extent permitted by law, Olde Money Printshop shall not be liable
            for any indirect, incidental, special, consequential, or punitive damages arising
            out of or related to your use of our Services. Our total liability for any claim
            arising from these Terms or our Services shall not exceed the amount you paid to
            us for the specific order giving rise to the claim.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">10. Disclaimer of Warranties</h2>
          <p className="mt-2">
            Our Services are provided &quot;as is&quot; and &quot;as available&quot; without
            warranties of any kind, either express or implied. We do not warrant that the
            Services will be uninterrupted, error-free, or free of viruses or other harmful
            components.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">11. Indemnification</h2>
          <p className="mt-2">
            You agree to indemnify, defend, and hold harmless Olde Money Printshop and its
            officers, directors, employees, and agents from any claims, damages, losses, or
            expenses arising from your use of the Services or your violation of these Terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">12. Governing Law</h2>
          <p className="mt-2">
            These Terms shall be governed by and construed in accordance with the laws of the
            State of California, without regard to its conflict of law principles. Any dispute
            arising from these Terms shall be resolved in the courts located in Los Angeles
            County, California.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">13. Changes to These Terms</h2>
          <p className="mt-2">
            We reserve the right to modify these Terms at any time. Changes will be effective
            when posted on this page with an updated &quot;Last updated&quot; date. Your
            continued use of the Services after changes are posted constitutes your acceptance
            of the revised Terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900">14. Contact Us</h2>
          <p className="mt-2">
            If you have any questions about these Terms of Service, please{' '}
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
