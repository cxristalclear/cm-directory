export async function generateStaticParams() {
  const states = ['california', 'texas', 'ohio', 'michigan'] // etc
  return states.map(state => ({ state }))
}

export async function generateMetadata({ params }) {
  const stateName = params.state.charAt(0).toUpperCase() + params.state.slice(1)
  
  return {
    title: `Contract Manufacturers in ${stateName} | Find Local Manufacturing Partners`,
    description: `Browse verified contract manufacturers in ${stateName}. Compare capabilities, certifications, and get quotes from local manufacturing partners.`,
  }
}