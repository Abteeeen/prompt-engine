import React from 'react'
import { Link } from 'react-router-dom'
import { Bullets, LegalLayout, Section } from '../components/LegalLayout'
import { COMPANY_NAME, SUPPORT_EMAIL } from '../config'
import { usePageTitle } from '../hooks/usePageTitle'

export default function PrivacyPage() {
  usePageTitle('Privacy Policy')
  return (
    <LegalLayout
      title="Privacy Policy"
      intro={`This policy explains what ${COMPANY_NAME} collects, why, and what control you have. The short version: we collect what we need to run the service, we do not sell your data, and you can delete everything from Settings.`}
    >
      <Section title="1. What we collect">
        <Bullets
          items={[
            <><strong className="text-white/80">Google account details</strong> when you sign in: your email address, display name and profile picture. We never see your Google password.</>,
            <><strong className="text-white/80">Prompts</strong>: the requests you type, files you attach as context, the prompts we generate, your edits, answers to clarifying questions, and anything you save to your library.</>,
            <><strong className="text-white/80">Business context</strong> you choose to enter in Settings (brand voice, product facts, audience, constraints).</>,
            <><strong className="text-white/80">Usage counts</strong>: how many generations you run per day, so we can apply daily limits.</>,
            <><strong className="text-white/80">Product analytics</strong>: anonymous events such as page views, copies and ratings, tied to a random per-session identifier.</>,
            <><strong className="text-white/80">Feedback</strong> you send through the feedback form, including an email address if you provide one.</>,
            <><strong className="text-white/80">Technical logs</strong>: IP address, browser type and timestamps, kept briefly for security and debugging.</>,
          ]}
        />
      </Section>

      <Section title="2. How we use it">
        <Bullets
          items={[
            'To generate, score and refine prompts for you.',
            'To keep your history and library available across devices when you are signed in.',
            'To inject your business context into generations so you do not have to repeat it.',
            'To enforce daily limits and prevent abuse.',
            'To understand which features are used and fix problems.',
            'To reply to feedback when you leave an email address.',
          ]}
        />
      </Section>

      <Section title="3. Third-party model providers">
        <p>
          To produce a prompt we send the text of your request (and any business context you have saved) to third-party AI model providers. These providers process the text
          to return a result. We only send what is needed for the generation, and we do not send your email address or name with it. Each provider&rsquo;s own privacy terms apply to that processing.
        </p>
      </Section>

      <Section title="4. What we do not do">
        <Bullets
          items={[
            'We do not sell your personal data or your prompts.',
            'We do not use your prompts for advertising.',
            'We do not share your data with third parties except the service providers needed to operate the product (hosting, database, model providers, Google sign-in).',
          ]}
        />
      </Section>

      <Section title="5. Cookies and local storage">
        <p>
          We do not use advertising cookies. The browser stores a sign-in token, your theme preference, and, for guests, a local copy of your prompt history,
          so the app works between visits. A per-session identifier is kept in session storage for usage limits and analytics.
        </p>
      </Section>

      <Section title="6. Retention and deletion">
        <p>
          Your account data, saved prompts, history and business context are kept until you delete them. You can delete individual library prompts at any time,
          and delete your whole account from <Link to="/settings" className="text-purple-400 hover:text-purple-300">Settings</Link>, which removes your data from our systems.
          Technical logs are retained for a short period and then discarded. Anonymous analytics cannot be linked back to you after account deletion.
        </p>
      </Section>

      <Section title="7. Security">
        <p>
          Data is transmitted over HTTPS and stored with access controls. No system is perfectly secure, so please avoid pasting secrets such as passwords or API keys into prompts.
        </p>
      </Section>

      <Section title="8. Your rights">
        <p>
          Depending on where you live, you may have the right to access, correct, export or delete your personal data, or object to certain processing.
          You can exercise most of these directly in the app; for anything else, email us and we will respond within 30 days.
        </p>
      </Section>

      <Section title="9. Children">
        <p>The service is not directed at children under 16 and we do not knowingly collect their data. If you believe a child has provided us data, contact us and we will delete it.</p>
      </Section>

      <Section title="10. Changes">
        <p>We may update this policy. The date at the top shows the latest revision. Material changes will be announced in the app.</p>
      </Section>

      <Section title="11. Contact">
        <p>
          Privacy questions and requests: <a href={`mailto:${SUPPORT_EMAIL}`} className="text-purple-400 hover:text-purple-300">{SUPPORT_EMAIL}</a>
        </p>
      </Section>
    </LegalLayout>
  )
}
