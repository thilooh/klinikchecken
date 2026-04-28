// Centralised tracking helpers for the methoden-quiz so the
// MethodenQuiz container, the steps, and the modals all emit Meta
// standard events with consistent parameters.
//
// What we send + when:
//   ViewContent        - quiz page mounted
//   AddToWishlist      - Q7 (Vermeidung) answered (mid-funnel intent)
//   CustomizeProduct   - recommendation generated (step 9 → 10)
//   Lead               - capture submit (step 11)
//   FindLocation       - result page mounted (step 12)
//   InitiateCheckout   - praxis modal opened
//   SubmitApplication  - praxis-anfrage submitted
//
// CAPI is paired (server-side via /.netlify/functions/meta-capi) on
// the conversion-relevant events (ViewContent, Lead, FindLocation,
// InitiateCheckout, SubmitApplication) so Meta gets a deduped second
// signal that's not blocked by ad-blockers / iOS tracking limits.
// Mid-funnel signals (AddToWishlist, CustomizeProduct) stay
// pixel-only - they exist for audience-building, not optimisation.

import type { QuizAnswers, ComputedProfile, QuizLead } from './quizState'
import { sendEvent } from './gtm'
import { generateEventId, sendCapi } from './capi'

// Quiz path bucket - "beine" or "gesicht" - useful as an audience
// segmentation parameter on every quiz event.
function quizPathFor(answers: QuizAnswers): 'beine' | 'gesicht' | 'unknown' {
  if (answers.q1_lokalisation === 'gesicht') return 'gesicht'
  if (answers.q1_lokalisation) return 'beine'
  return 'unknown'
}

function baseParams(answers: QuizAnswers, ctaVariant: string | undefined) {
  return {
    content_type: 'methoden_quiz',
    quiz_path: quizPathFor(answers),
    cta_variant: ctaVariant ?? 'unknown',
  }
}

export function trackQuizView(ctaVariant: string): void {
  const eventId = generateEventId()
  const data = {
    content_type: 'methoden_quiz',
    content_name: 'quiz_landing',
    cta_variant: ctaVariant,
  }
  sendEvent('ViewContent', data, undefined, eventId)
  sendCapi('ViewContent', eventId, data)
}

// Strong mid-funnel investment signal - the user just told us their
// behaviour is influenced by their Besenreiser. Pixel-only is enough;
// CAPI is reserved for events Meta optimises against.
export function trackQuizWishlist(answers: QuizAnswers, ctaVariant: string): void {
  sendEvent('AddToWishlist', {
    ...baseParams(answers, ctaVariant),
    content_name: 'quiz_q7_committed',
    vermeidung: answers.q7_vermeidung ?? 'unknown',
  })
}

export function trackQuizCustomize(answers: QuizAnswers, ctaVariant: string): void {
  sendEvent('CustomizeProduct', {
    ...baseParams(answers, ctaVariant),
    content_name: 'quiz_recommendation_ready',
  })
}

export function trackQuizLead(
  answers: QuizAnswers,
  lead: QuizLead,
  profile: ComputedProfile,
  ctaVariant: string,
): void {
  const eventId = generateEventId()
  const data = {
    ...baseParams(answers, ctaVariant),
    content_name: profile.typ,
    item_name: profile.typ,
    plz: lead.plz.trim(),
    consent_marketing: lead.consent_marketing,
    computed_typ: profile.typ,
    auspraegung: profile.auspraegungScore,
    dringlichkeit: profile.dringlichkeitScore,
  }
  const userData = { email: lead.email }
  sendEvent('Lead', data, userData, eventId)
  sendCapi('Lead', eventId, data, userData)
}

export function trackQuizFindLocation(
  answers: QuizAnswers,
  lead: QuizLead,
  profile: ComputedProfile,
  praxenCount: number,
  ctaVariant: string,
): void {
  const eventId = generateEventId()
  const data = {
    ...baseParams(answers, ctaVariant),
    content_name: profile.typ,
    item_name: profile.typ,
    plz: lead.plz.trim(),
    praxen_count: praxenCount,
    computed_typ: profile.typ,
  }
  sendEvent('FindLocation', data, undefined, eventId)
  sendCapi('FindLocation', eventId, data)
}

type ModalPraxis = {
  id: number
  name: string
  city: string
  tier: string
}

export function trackPraxisModalOpen(
  praxis: ModalPraxis,
  answers: QuizAnswers,
  ctaVariant: string,
): void {
  const eventId = generateEventId()
  const data = {
    ...baseParams(answers, ctaVariant),
    content_name: praxis.name,
    content_category: praxis.city,
    item_name: praxis.name,
    item_category: praxis.city,
    praxis_id: praxis.id,
    praxis_tier: praxis.tier,
    source: 'methoden_quiz',
  }
  sendEvent('InitiateCheckout', data, undefined, eventId)
  sendCapi('InitiateCheckout', eventId, data)
}

export function trackPraxisAnfrage(
  praxis: ModalPraxis,
  answers: QuizAnswers,
  lead: QuizLead,
  email: string,
  phone: string | undefined,
  ctaVariant: string,
): void {
  const eventId = generateEventId()
  const data = {
    ...baseParams(answers, ctaVariant),
    content_name: praxis.name,
    content_category: praxis.city,
    item_name: praxis.name,
    item_category: praxis.city,
    praxis_id: praxis.id,
    praxis_tier: praxis.tier,
    plz: lead.plz.trim(),
    source: 'methoden_quiz',
  }
  const userData = { email, phone: phone || undefined }
  sendEvent('SubmitApplication', data, userData, eventId)
  sendCapi('SubmitApplication', eventId, data, userData)
}
