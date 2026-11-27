/**
 * Demo content: wipes pages, projects and media, then creates the site from scratch.
 * Users are kept; the admin from SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD is created if missing.
 */
import type { Payload, RequiredDataFromCollectionSlug } from 'payload'

import type { Media, Page, Project } from '@/payload-types'

import { renderArtwork, type Composition, type Palette } from './artwork'
import { doc, h, p, ul } from './lexical'

// Seed scripts run outside Next: no revalidation
const context = { disableRevalidate: true }

type Ref = { relationTo: 'pages' | 'projects'; value: number }
const link = (label: string, reference: Ref, appearance: 'default' | 'outline' = 'default') => ({
  link: { type: 'reference' as const, label, reference, appearance },
})
const external = (label: string, url: string) => ({ link: { type: 'custom' as const, label, url, newTab: true } })

export async function seed(payload: Payload): Promise<void> {
  const log = (msg: string) => payload.logger.info(`[seed] ${msg}`)

  // --- Admin user -------------------------------------------------------------------------------
  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD
  if (email && password) {
    const { totalDocs } = await payload.count({ collection: 'users', where: { email: { equals: email } } })
    if (!totalDocs) {
      await payload.create({ collection: 'users', data: { email, password, name: 'Demo Editor' }, context })
      log(`created admin ${email}`)
    }
  } else {
    log('SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set: no admin user created')
  }

  // --- Reset content ----------------------------------------------------------------------------
  for (const collection of ['pages', 'projects', 'media'] as const) {
    await payload.delete({ collection, where: { id: { exists: true } }, context })
  }
  log('cleared pages, projects and media')

  // --- Images -----------------------------------------------------------------------------------
  let seedNo = 0
  const image = async (name: string, alt: string, kind: Composition, palette: Palette, size?: [number, number]): Promise<Media> => {
    const data = await renderArtwork(kind, palette, ++seedNo, ...(size ?? []))
    return payload.create({
      collection: 'media',
      data: { alt },
      file: { data, mimetype: 'image/webp', name: `${name}.webp`, size: data.length },
      context,
    })
  }
  const portrait = (name: string, alt: string, palette: Palette) => image(name, alt, 'portrait', palette, [800, 1000])

  const img = {
    hero: await image('hero-studio', 'Abstract indigo light orbs over a fine grid', 'orbs', 'indigo'),
    about: await image('about-studio', 'Overlapping teal arcs', 'arcs', 'teal'),
    services: await image('services', 'Diagonal bands in slate and blue', 'bands', 'slate'),
    checkout: await image('freshway-checkout', 'Emerald interface blocks', 'blocks', 'emerald'),
    checkout2: await image('freshway-detail', 'Emerald light orbs', 'orbs', 'emerald'),
    designSystem: await image('halcyon-design-system', 'Indigo component grid', 'blocks', 'indigo'),
    designSystem2: await image('halcyon-tokens', 'Indigo diagonal bands', 'bands', 'indigo'),
    forecast: await image('arden-forecast', 'Amber arcs like a rising chart', 'arcs', 'amber'),
    forecast2: await image('arden-detail', 'Amber light orbs', 'orbs', 'amber'),
    insurer: await image('mutual-harbor', 'Slate light orbs', 'orbs', 'slate'),
    insurer2: await image('mutual-harbor-workshop', 'Slate arcs', 'arcs', 'slate'),
    health: await image('cedar-health', 'Rose diagonal bands', 'bands', 'rose'),
    health2: await image('cedar-health-detail', 'Rose interface blocks', 'blocks', 'rose'),
    fleet: await image('voltline-fleet', 'Teal interface blocks', 'blocks', 'teal'),
    fleet2: await image('voltline-map', 'Teal light orbs', 'orbs', 'teal'),
    ava: await portrait('team-ava', 'Portrait illustration of Ava Lindqvist', 'indigo'),
    marcus: await portrait('team-marcus', 'Portrait illustration of Marcus Webb', 'teal'),
    priya: await portrait('team-priya', 'Portrait illustration of Priya Raman', 'amber'),
    jonas: await portrait('team-jonas', 'Portrait illustration of Jonas Keller', 'rose'),
  }
  log(`created ${Object.keys(img).length} images`)

  // --- Projects ---------------------------------------------------------------------------------
  type ProjectData = RequiredDataFromCollectionSlug<'projects'>
  const projectData: ProjectData[] = [
    {
      title: 'A checkout that keeps up with the weekly shop',
      slug: 'freshway-checkout',
      client: 'Freshway Markets',
      category: 'engineering',
      year: 2026,
      featured: true,
      excerpt: 'We rebuilt the online checkout of a national grocer, cutting load times in half and lifting conversion on mobile by a fifth.',
      coverImage: img.checkout.id,
      services: [{ name: 'Platform engineering' }, { name: 'Performance' }, { name: 'Payments' }],
      challenge: 'Peak hours brought the old checkout to its knees: a monolith, eleven payment steps and timeouts every Saturday morning.',
      solution: 'A new checkout service with a three-step flow, saved baskets and payments that retry instead of failing, released market by market.',
      results: [
        { value: 48, suffix: '%', label: 'faster checkout' },
        { value: 21, prefix: '+', suffix: '%', label: 'more mobile orders' },
        { value: 99.98, suffix: '%', label: 'uptime at peak' },
        { value: 6, label: 'months to roll out' },
      ],
      body: doc(
        h('h2', 'From eleven steps to three'),
        p('We started where customers dropped off: the delivery slot and payment steps. Shadowing support calls and reading session data showed that most abandoned baskets were lost to errors, not doubts.'),
        p('The new checkout keeps the basket on the server, reserves a delivery slot as soon as it is picked and lets payments ', { bold: 'retry quietly' }, ' when a provider is slow.'),
        h('h3', 'What we delivered'),
        ul('A checkout service with a clear API for web and apps', 'Load tests that replay a real Saturday morning', 'A release plan that switched one market at a time'),
      ),
      gallery: [
        { image: img.checkout2.id, caption: 'The new delivery slot picker, designed for one hand.' },
        { image: img.fleet.id, caption: 'Service map of the checkout platform.' },
        { image: img.forecast2.id, caption: 'Peak-hour load tests, replayed weekly.' },
      ],
      testimonial: { quote: 'Saturday mornings used to be our worst hours. Now they are our best.', author: 'Helena Brooks', role: 'VP Digital, Freshway Markets' },
      _status: 'published',
    },
    {
      title: 'One design system for forty product teams',
      slug: 'halcyon-design-system',
      client: 'Halcyon Bank',
      category: 'design',
      year: 2025,
      featured: true,
      excerpt: 'A shared design system and the governance around it, so a bank’s forty teams ship consistent, accessible interfaces faster.',
      coverImage: img.designSystem.id,
      services: [{ name: 'Design systems' }, { name: 'Accessibility' }, { name: 'Design ops' }],
      challenge: 'Six button styles, four shades of brand blue and an accessibility audit that nobody wanted to read.',
      solution: 'Tokens, components and documentation in one place, owned by a small core team and open to contributions from every squad.',
      results: [
        { value: 40, label: 'teams on the system' },
        { value: 120, label: 'components and patterns' },
        { value: 35, suffix: '%', label: 'faster UI delivery' },
        { value: 100, suffix: '%', label: 'WCAG AA on core flows' },
      ],
      body: doc(
        h('h2', 'Governance is the product'),
        p('Components are the easy part. We spent as much time on how teams propose changes, how releases are versioned and how adoption is measured as on the components themselves.'),
        ul('Design tokens shared by web, iOS and Android', 'A contribution model with weekly office hours', 'Adoption dashboards per team'),
      ),
      gallery: [
        { image: img.designSystem2.id, caption: 'The token architecture: from brand to component.' },
        { image: img.health2.id, caption: 'Component documentation with live examples.' },
      ],
      testimonial: { quote: 'For the first time, our apps feel like one bank.', author: 'Daniel Osei', role: 'Head of Design, Halcyon Bank' },
      _status: 'published',
    },
    {
      title: 'Forecasting demand before it arrives',
      slug: 'arden-demand-forecasting',
      client: 'Arden Logistics',
      category: 'data',
      year: 2025,
      featured: true,
      excerpt: 'Machine-learning forecasts that tell warehouse planners what next week will look like, down to the hour and the dock door.',
      coverImage: img.forecast.id,
      services: [{ name: 'Machine learning' }, { name: 'Data platform' }, { name: 'MLOps' }],
      challenge: 'Planners staffed warehouses on gut feeling and last year’s spreadsheet, so overtime and idle shifts were routine.',
      solution: 'Hourly forecasts from order, weather and promotion data, explained in plain language inside the planning tool people already use.',
      results: [
        { value: 31, suffix: '%', label: 'less overtime' },
        { value: 92, suffix: '%', label: 'forecast accuracy' },
        { value: 14, label: 'warehouses live' },
      ],
      body: doc(
        h('h2', 'Forecasts people trust'),
        p('Accuracy alone doesn’t change behaviour. Every forecast comes with the three factors that moved it most, so planners can check it against what they know.'),
      ),
      gallery: [{ image: img.forecast2.id, caption: 'Forecast explanations inside the planning tool.' }],
      testimonial: { quote: 'The forecasts are right often enough that people stopped arguing with them.', author: 'Sofia Marin', role: 'COO, Arden Logistics' },
      _status: 'published',
    },
    {
      title: 'A digital strategy for a 120-year-old insurer',
      slug: 'mutual-harbor-strategy',
      client: 'Mutual Harbor',
      category: 'strategy',
      year: 2024,
      excerpt: 'A three-year roadmap that moved a traditional insurer from paper forms to self-service, with the business case to fund it.',
      coverImage: img.insurer.id,
      services: [{ name: 'Digital strategy' }, { name: 'Customer research' }, { name: 'Roadmapping' }],
      challenge: 'Claims took weeks, customers called to ask where they stood, and every department had its own transformation plan.',
      solution: 'One roadmap built from forty customer interviews, with claims self-service as the first, measurable milestone.',
      results: [
        { value: 40, label: 'customer interviews' },
        { value: 3, label: 'year roadmap' },
        { value: 12, prefix: '€', suffix: 'M', label: 'savings in the business case' },
      ],
      gallery: [{ image: img.insurer2.id, caption: 'Workshop outcomes, clustered by customer journey.' }],
      _status: 'published',
    },
    {
      title: 'A patient app that people actually open',
      slug: 'cedar-health-app',
      client: 'Cedar Health',
      category: 'design',
      year: 2024,
      excerpt: 'Appointments, results and messages in one calm app for a network of twelve hospitals, designed with patients and nurses.',
      coverImage: img.health.id,
      services: [{ name: 'Product design' }, { name: 'Research' }, { name: 'iOS & Android' }],
      challenge: 'Three portals, three logins, and a call centre that spent half its day resetting passwords.',
      solution: 'One app built around the next appointment, co-designed in weekly sessions with patients, nurses and doctors.',
      results: [
        { value: 4.8, label: 'App Store rating' },
        { value: 62, suffix: '%', label: 'fewer support calls' },
        { value: 250, suffix: 'k', label: 'monthly patients' },
      ],
      gallery: [{ image: img.health2.id, caption: 'The appointment timeline.' }],
      testimonial: { quote: 'Patients tell us the app is the least stressful part of their visit.', author: 'Dr. Amara Okafor', role: 'CMIO, Cedar Health' },
      _status: 'published',
    },
    {
      title: 'Real-time operations for an electric fleet',
      slug: 'voltline-fleet-platform',
      client: 'Voltline Mobility',
      category: 'engineering',
      year: 2023,
      excerpt: 'A platform that tracks thousands of electric vehicles live and schedules charging around the grid’s cheapest hours.',
      coverImage: img.fleet.id,
      services: [{ name: 'Cloud architecture' }, { name: 'Real-time data' }, { name: 'Product engineering' }],
      challenge: 'Vehicle data arrived minutes late, and charging ran whenever a driver plugged in, at any price.',
      solution: 'An event-driven platform that streams vehicle telemetry in seconds and plans charging against grid prices.',
      results: [
        { value: 8000, suffix: '+', label: 'vehicles connected' },
        { value: 2, suffix: 's', label: 'data latency' },
        { value: 18, suffix: '%', label: 'lower energy cost' },
      ],
      gallery: [{ image: img.fleet2.id, caption: 'The live operations map.' }],
      _status: 'published',
    },
  ]

  const projects: Project[] = []
  for (const data of projectData) projects.push(await payload.create({ collection: 'projects', data, context }))
  // Related projects: the next two, wrapping around
  for (const [i, project] of projects.entries()) {
    const relatedProjects = [projects[(i + 1) % projects.length].id, projects[(i + 2) % projects.length].id]
    await payload.update({ collection: 'projects', id: project.id, data: { relatedProjects }, context })
  }
  log(`created ${projects.length} projects`)

  // --- Pages ------------------------------------------------------------------------------------
  // Created as empty drafts first, so pages can link to each other; filled in and published below.
  const slugs = ['home', 'projects', 'services', 'about', 'contact'] as const
  type Slug = (typeof slugs)[number]
  const pages = {} as Record<Slug, Page>
  for (const slug of slugs) {
    const title = slug === 'home' ? 'Home' : slug[0].toUpperCase() + slug.slice(1)
    pages[slug] = await payload.create({ collection: 'pages', draft: true, data: { title, slug, layout: [] }, context })
  }
  const ref = (slug: Slug): Ref => ({ relationTo: 'pages', value: pages[slug].id })

  const contactCta: Page['layout'][number] = {
    blockType: 'cta',
    heading: 'Have a project in mind?',
    description: 'Tell us where you want to go. We reply within two working days, with honest advice even if we’re not the right fit.',
    links: [link('Start a project', ref('contact')), link('See our work', ref('projects'), 'outline')],
  }

  const content: Record<Slug, { title: string; layout: Page['layout']; meta?: Page['meta'] }> = {
    home: {
      title: 'Home',
      meta: {
        title: 'Lumora: strategy, design and engineering',
        description: 'We help ambitious organisations design and build digital products people love to use.',
      },
      layout: [
        {
          blockType: 'hero',
          eyebrow: 'Strategy, design and engineering',
          heading: 'We build digital products that move organisations forward',
          description: 'Lumora is an independent studio of strategists, designers and engineers. We partner with ambitious teams to turn complex problems into products people love to use.',
          links: [link('See our work', ref('projects')), link('What we do', ref('services'), 'outline')],
          image: img.hero.id,
          layout: 'split',
        },
        {
          blockType: 'logoCloud',
          heading: 'Trusted by teams at',
          clients: ['Freshway', 'Halcyon', 'Arden', 'Mutual Harbor', 'Cedar Health', 'Voltline'].map((name) => ({ name })),
        },
        {
          blockType: 'features',
          eyebrow: 'What we do',
          heading: 'One team from first question to final release',
          description: 'We combine strategy, design and engineering, so nothing gets lost between a slide deck and a shipped product.',
          items: [
            { icon: 'compass', title: 'Digital strategy', description: 'Find the opportunities worth pursuing and a roadmap your organisation can deliver.' },
            { icon: 'sparkles', title: 'Product design', description: 'Research-led interfaces that are clear, accessible and a pleasure to use.' },
            { icon: 'code', title: 'Engineering', description: 'Fast, reliable software on modern, cloud-native foundations.' },
            { icon: 'chart', title: 'Data & AI', description: 'Turn data into forecasts and features that change decisions.' },
            { icon: 'layers', title: 'Design systems', description: 'Shared foundations that keep many teams consistent and fast.' },
            { icon: 'shield', title: 'Accessibility', description: 'Inclusive products that meet WCAG, built in from the start.' },
          ],
        },
        {
          blockType: 'stats',
          eyebrow: 'In numbers',
          heading: 'Fifteen years of shipping',
          items: [
            { value: 120, suffix: '+', label: 'products launched' },
            { value: 45, label: 'strategists, designers and engineers' },
            { value: 98, suffix: '%', label: 'of clients come back' },
            { value: 12, label: 'industry awards' },
          ],
        },
        {
          blockType: 'featuredProjects',
          eyebrow: 'Selected work',
          heading: 'Recent projects',
          description: 'A few of the products we’ve built with our clients.',
          source: 'featured',
          limit: 3,
          showLink: true,
          link: { type: 'reference', label: 'All projects', reference: ref('projects') },
        },
        {
          blockType: 'testimonial',
          quote: 'Lumora worked like part of our team from day one. They challenged our assumptions and shipped faster than we thought possible.',
          author: 'Helena Brooks',
          role: 'VP Digital, Freshway Markets',
        },
        contactCta,
      ],
    },
    projects: {
      title: 'Projects',
      meta: { description: 'Case studies in strategy, design, engineering and data.' },
      layout: [
        {
          blockType: 'projectIndex',
          eyebrow: 'Our work',
          heading: 'Products we’re proud of',
          description: 'Case studies from strategy to launch, across retail, finance, health and mobility.',
          showFilters: true,
        },
        contactCta,
      ],
    },
    services: {
      title: 'Services',
      meta: { description: 'Strategy, product design, engineering and data, in one team.' },
      layout: [
        {
          blockType: 'hero',
          eyebrow: 'Services',
          heading: 'Everything it takes to ship a great product',
          description: 'Engage us for a focused sprint or a multi-year partnership. Either way, you get senior people who care about outcomes.',
          links: [link('Talk to us', ref('contact'))],
          image: img.services.id,
          layout: 'centered',
        },
        {
          blockType: 'features',
          eyebrow: 'Capabilities',
          heading: 'How we can help',
          items: [
            { icon: 'compass', title: 'Discovery sprints', description: 'Two to four weeks to find out what to build and why, with a prototype to prove it.' },
            { icon: 'users', title: 'Customer research', description: 'Interviews, diary studies and usability tests that put real people in the room.' },
            { icon: 'sparkles', title: 'Product & UX design', description: 'From flows and prototypes to pixel-perfect interfaces.' },
            { icon: 'code', title: 'Web & mobile engineering', description: 'React, Next.js, native apps and the APIs behind them.' },
            { icon: 'rocket', title: 'Platform & cloud', description: 'Architecture, infrastructure and DevOps that scale with you.' },
            { icon: 'chart', title: 'Data & machine learning', description: 'Pipelines, forecasts and AI features that hold up in production.' },
          ],
        },
        {
          blockType: 'faq',
          eyebrow: 'FAQ',
          heading: 'Common questions',
          description: 'Anything else? Get in touch and ask.',
          items: [
            { question: 'How do projects usually start?', answer: 'With a short discovery phase. We agree on goals, meet your users and leave you with a plan, whether or not we build it together.' },
            { question: 'Do you work with in-house teams?', answer: 'Most of the time. We like mixed teams, and we leave behind documentation and skills, not dependencies.' },
            { question: 'How do you price your work?', answer: 'Fixed price for well-defined phases, time and materials for ongoing product work. Always with a clear budget up front.' },
            { question: 'Where are you based?', answer: 'Our team is spread across Europe and works remotely, with regular on-site workshops with our clients.' },
          ],
        },
        contactCta,
      ],
    },
    about: {
      title: 'About',
      meta: { description: 'An independent studio of strategists, designers and engineers.' },
      layout: [
        {
          blockType: 'hero',
          eyebrow: 'About us',
          heading: 'Small enough to care, big enough to deliver',
          description: 'Since 2011 we’ve helped organisations of every size build products that matter. We’re independent, senior and refreshingly direct.',
          image: img.about.id,
          layout: 'split',
        },
        {
          blockType: 'content',
          eyebrow: 'Our story',
          heading: 'Why we started Lumora',
          body: doc(
            p('We founded Lumora because we were tired of strategies that never shipped and products that solved the wrong problem. We wanted one team that could do both: ask the hard questions, then build the answer.'),
            p('Fifteen years later, that is still how we work. ', { bold: 'Small, senior teams' }, ' that own the outcome together with our clients, from the first workshop to the last release.'),
            h('h3', 'What we believe'),
            ul('Talk to users early and often', 'Ship small, learn fast', 'Accessibility is not optional', 'Leave teams stronger than we found them'),
          ),
        },
        {
          blockType: 'stats',
          heading: 'Lumora at a glance',
          items: [
            { value: 2011, label: 'founded' },
            { value: 45, label: 'people' },
            { value: 9, label: 'countries' },
            { value: 120, suffix: '+', label: 'products launched' },
          ],
        },
        {
          blockType: 'team',
          eyebrow: 'Leadership',
          heading: 'The people behind the work',
          members: [
            { name: 'Ava Lindqvist', role: 'Co-founder & CEO', photo: img.ava.id },
            { name: 'Marcus Webb', role: 'Co-founder & CTO', photo: img.marcus.id },
            { name: 'Priya Raman', role: 'Design Director', photo: img.priya.id },
            { name: 'Jonas Keller', role: 'Head of Data', photo: img.jonas.id },
          ],
        },
        contactCta,
      ],
    },
    contact: {
      title: 'Contact',
      meta: { description: 'Tell us about your project.' },
      layout: [
        {
          blockType: 'hero',
          eyebrow: 'Contact',
          heading: 'Let’s talk about your project',
          description: 'Write to hello@lumora.example or call +1 555 0100. We reply within two working days.',
          links: [{ link: { type: 'custom', label: 'Email us', url: 'mailto:hello@lumora.example', appearance: 'default' } }],
          layout: 'centered',
        },
        {
          blockType: 'faq',
          eyebrow: 'Before you write',
          heading: 'What happens next',
          items: [
            { question: 'Who will reply?', answer: 'One of our partners, not a sales team. They’ll suggest a short call to understand your goals.' },
            { question: 'What should I send?', answer: 'Whatever you have: a brief, a problem statement or just a few sentences. We’ll take it from there.' },
            { question: 'Do you sign NDAs?', answer: 'Of course. Send yours along, or ask for ours.' },
          ],
        },
      ],
    },
  }

  for (const slug of slugs) {
    await payload.update({ collection: 'pages', id: pages[slug].id, data: { ...content[slug], _status: 'published' }, context })
  }
  log(`created ${slugs.length} pages`)

  // --- Header & footer --------------------------------------------------------------------------
  await payload.updateGlobal({
    slug: 'header',
    data: {
      brand: 'Lumora',
      navItems: [link('Projects', ref('projects')), link('Services', ref('services')), link('About', ref('about')), link('Contact', ref('contact'))],
      cta: { type: 'reference', label: 'Start a project', reference: ref('contact') },
    },
    context,
  })
  await payload.updateGlobal({
    slug: 'footer',
    data: {
      tagline: 'An independent studio for strategy, design and engineering. This site is a demo of visual editing for Payload.',
      columns: [
        { title: 'Company', links: [link('About', ref('about')), link('Projects', ref('projects')), link('Contact', ref('contact'))] },
        { title: 'Work', links: projects.slice(0, 3).map((project) => link(project.client, { relationTo: 'projects', value: project.id })) },
        { title: 'Demo', links: [external('Admin', '/admin'), external('GitHub', 'https://github.com/derweili/payload-visual-editing')] },
      ],
      legal: `© ${new Date().getFullYear()} Lumora. A fictional company for demonstration purposes.`,
    },
    context,
  })
  log('updated header and footer')
}
