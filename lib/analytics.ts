import posthog from 'posthog-js'

// ─────────────────────────────────────────────────────────────────────────────
// useAnalytics — Hook para trackear eventos de producto en PRAIRON
//
// USO:
//   const { track, identify } = useAnalytics()
//   track('farm_created', { farmType: 'ganadera', area: 120 })
//   identify(userId, { name, email, companyName })
// ─────────────────────────────────────────────────────────────────────────────

export function useAnalytics() {

  // Trackea un evento con propiedades opcionales
  function track(event: string, properties?: Record<string, any>) {
    if (typeof window === 'undefined') return
    posthog.capture(event, properties)
  }

  // Identifica al usuario para asociar eventos con personas reales
  function identify(userId: string, properties?: Record<string, any>) {
    if (typeof window === 'undefined') return
    posthog.identify(userId, properties)
  }

  // Trackea eventos de módulos con contexto estándar
  const events = {
    // Auth
    login:           (method = 'email')       => track('user_logged_in', { method }),
    register:        (companyType: string)    => track('user_registered', { companyType }),
    onboardingStep:  (step: number)           => track('onboarding_step_completed', { step }),
    onboardingDone:  (productionType: string) => track('onboarding_completed', { productionType }),

    // Módulos
    farmCreated:     (type: string)           => track('farm_created', { type }),
    animalCreated:   (animalType: string)     => track('animal_created', { animalType }),
    taskCreated:     (taskType: string)       => track('task_created', { taskType }),
    taskCompleted:   (taskType: string)       => track('task_completed', { taskType }),
    inventoryAdded:  (itemType: string)       => track('inventory_item_added', { itemType }),

    // IA
    nohChat:         ()                       => track('noh_chat_opened'),
    nohMessage:      ()                       => track('noh_message_sent'),
    visionAnalyzed:  ()                       => track('vision_image_analyzed'),
    cropRecommended: ()                       => track('crop_recommendation_viewed'),
    pdfDownloaded:   ()                       => track('pdf_report_downloaded'),

    // Navegación
    pageView:        (page: string)           => track('page_viewed', { page }),
  }

  return { track, identify, events }
}
