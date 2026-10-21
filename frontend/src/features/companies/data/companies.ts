export interface Company {
  id: string;
  name: string;
  logoUrl: string;
  companyUrl: string;
  description?: string;
}

export const FEATURED_COMPANIES: Company[] = [
  {
    id: 'uber',
    name: 'Uber',
    companyUrl: 'https://www.instahyre.com/jobs-at-uber/',
    logoUrl: 'https://media.instahyre.com/images/branding/logos/859/uber.webp',
    description: 'Mobility, delivery and freight technology platform',
  },
  {
    id: 'de-shaw',
    name: 'D. E. Shaw',
    companyUrl: 'https://www.instahyre.com/jobs-at-d-e/',
    logoUrl: 'https://media.instahyre.com/images/branding/logos/1005/d-e.webp',
    description: 'Global investment and technology development firm',
  },
  {
    id: 'rubrik',
    name: 'Rubrik',
    companyUrl: 'https://www.instahyre.com/jobs-at-rubrik-2/',
    logoUrl: 'https://media.instahyre.com/images/branding/logos/2993/rubrik-2.webp',
    description: 'Zero Trust Data Security and cyber resilience',
  },
  {
    id: 'optum',
    name: 'Optum',
    companyUrl: 'https://www.instahyre.com/jobs-at-optum/',
    logoUrl: 'https://media.instahyre.com/images/branding/logos/5541/optum.webp',
    description: 'Health services and innovation company',
  },
  {
    id: 'blinkit',
    name: 'Blinkit',
    companyUrl: 'https://www.instahyre.com/jobs-at-blinkit/',
    logoUrl: 'https://media.instahyre.com/images/branding/logos/333/blinkit.webp',
    description: 'Instant commerce and quick delivery network',
  },
  {
    id: 'tekion',
    name: 'Tekion',
    companyUrl: 'https://www.instahyre.com/jobs-at-tekion/',
    logoUrl: 'https://media.instahyre.com/images/branding/logos/5276/tekion.webp',
    description: 'Cloud-native automotive retail platform',
  },
  {
    id: 'rippling',
    name: 'Rippling',
    companyUrl: 'https://www.instahyre.com/jobs-at-rippling/',
    logoUrl: 'https://media.instahyre.com/images/branding/logos/2132/rippling.webp',
    description: 'Workforce management, HR, IT and finance system',
  },
  {
    id: 'amazon',
    name: 'Amazon',
    companyUrl: 'https://www.instahyre.com/jobs-at-amazon/',
    logoUrl: 'https://media.instahyre.com/images/branding/logos/377/amazon.webp',
    description: 'Global e-commerce, cloud computing and digital streaming',
  },
  {
    id: 'adobe',
    name: 'Adobe',
    companyUrl: 'https://www.instahyre.com/jobs-at-adobe/',
    logoUrl: 'https://media.instahyre.com/images/branding/logos/1520/adobe.webp',
    description: 'Creativity, digital marketing and document management software',
  },
  {
    id: 'infosys',
    name: 'Infosys',
    companyUrl: 'https://www.instahyre.com/jobs-at-infosys-4/',
    logoUrl: 'https://media.instahyre.com/images/branding/logos/3604/infosys-4.webp',
    description: 'Digital services, consulting and next-generation solutions',
  },
  {
    id: 'zepto',
    name: 'Zepto',
    companyUrl: 'https://www.instahyre.com/jobs-at-zepto/',
    logoUrl: 'https://media.instahyre.com/images/branding/logos/34141/zepto.webp',
    description: 'Quick-commerce grocery delivery platform',
  },
];
