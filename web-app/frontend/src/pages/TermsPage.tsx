import React from 'react'
import { Link } from 'react-router-dom'
import { Bullets, LegalLayout, Section } from '../components/LegalLayout'
import { COMPANY_NAME, SUPPORT_EMAIL } from '../config'
import { usePageTitle } from '../hooks/usePageTitle'

export default function TermsPage() {
  usePageTitle('Terms of Service')
  return (
    <LegalLayout
      title="Terms of Service"
      intro={`These terms govern your use of ${COMPANY_NAME}, a service that turns your rough ideas into structured prompts for AI assistants. By using the service you agree to them.`}
    >
      <Section title="1. The service">
        <p>
          {COMPANY_NAME} takes a request you type, analyzes it, and produces a prompt you can paste into tools such as ChatGPT, Claude or Gemini.
          It also offers fill-in templates, a quality score, and, for signed-in users, a library and history.
        </p>
        <p>We may change, add or remove features at any time. We will try to give notice of changes that materially reduce the service.</p>
      </Section>

      <Section title="2. Accounts">
        <Bullets
          items={[
            'You can use the service as a guest with a daily limit, or sign in with a Google account for a higher limit and saved data.',
            'You are responsible for activity under your account and for keeping access to your Google account secure.',
            'You must be at least 16 years old, or the age of digital consent where you live, to create an account.',
            <>You can delete your account at any time from <Link to="/settings" className="text-purple-400 hover:text-purple-300">Settings</Link>. Deletion removes your saved prompts, history and business context.</>,
          ]}
        />
      </Section>

      <Section title="3. Acceptable use">
        <p>Do not use the service to:</p>
        <Bullets
          items={[
            'Generate content that is illegal, or that facilitates harm to others.',
            'Attempt to bypass usage limits, scrape the service, or interfere with its operation or security.',
            'Submit content you do not have the right to share, including other people’s confidential or personal data.',
            'Resell or offer the service as your own without our written permission.',
          ]}
        />
        <p>We may suspend or terminate accounts that violate these rules.</p>
      </Section>

      <Section title="4. Your content">
        <p>
          You keep ownership of the requests you type and the prompts you generate, edit and save. You grant us a limited license to store and
          process that content solely to operate and improve the service, including sending prompt text to third-party model providers to generate results.
        </p>
        <p>You are responsible for the content you submit and for how you use the prompts you receive.</p>
      </Section>

      <Section title="5. AI output">
        <p>
          Generated prompts and quality scores are produced automatically by machine-learning models. They can be wrong, incomplete or unsuitable
          for your purpose. Review everything before you rely on it. We make no guarantee about the results you obtain from other AI tools using our prompts.
        </p>
      </Section>

      <Section title="6. Third-party services">
        <p>
          The service uses third-party model providers to analyze requests and generate prompts, and Google for sign-in. Those services have their own terms.
          Links that open ChatGPT or Claude take you to services operated by OpenAI and Anthropic respectively, which we do not control.
        </p>
      </Section>

      <Section title="7. Free tier and limits">
        <p>
          The service currently offers free daily generation limits that differ for guests and signed-in users. Limits, plans and pricing may change.
          If we introduce paid plans, their terms will be presented before you are charged.
        </p>
      </Section>

      <Section title="8. Disclaimer and limitation of liability">
        <p>
          The service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, express or implied. To the fullest extent permitted by law,
          {` ${COMPANY_NAME}`} is not liable for indirect, incidental or consequential damages, or for any loss arising from your use of generated content.
          Our total liability for any claim is limited to the amount you paid us in the twelve months before the claim, or USD 50 if you paid nothing.
        </p>
      </Section>

      <Section title="9. Changes to these terms">
        <p>We may update these terms. The date at the top shows the latest revision. Continued use after a change means you accept the new terms.</p>
      </Section>

      <Section title="10. Contact">
        <p>
          Questions about these terms: <a href={`mailto:${SUPPORT_EMAIL}`} className="text-purple-400 hover:text-purple-300">{SUPPORT_EMAIL}</a>
        </p>
      </Section>
    </LegalLayout>
  )
}
