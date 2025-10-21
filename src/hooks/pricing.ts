// pricing.ts
export const pricingTable: Record<string, Record<string, number | string>> = {
  USD: {
    Basic: 0,
    Premium: 9.99,
    Pro: 19.99,
  },
  INR: {
    Basic: 0,
    Premium: 650,
    Pro: 1200,
  },
  EUR: {
    Basic: 0,
    Premium: 8.99,
    Pro: 17.99,
  }
};

export const currencySymbols: Record<string, string> = {
  USD: '$',
  INR: '₹',
  EUR: '€'
};



export const planFeatures: Record<string, { uploads: string; features: string[] }> = {
  Basic: {
    uploads: '3 uploads/month',
    features: [
      'Basic ATS scoring',
      'Resume analysis',
      'Standard support'
    ]
  },
  Premium: {
    uploads: '25 uploads/month',
    features: [
      'Advanced ATS scoring',
      'Detailed feedback',
      'Job matching',
      'Priority support'
    ]
  },
  Pro: {
    uploads: '100 uploads/month',
    features: [
      'Everything in Premium',
      'Custom resume builder',
      'API access',
      'Dedicated support'
    ]
  }
};