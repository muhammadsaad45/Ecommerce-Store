export const metadata = {
  title: "Frequently Asked Questions | TechStore",
  description: "Find answers to common questions about shipping, returns, and warranties.",
};

const faqs = [
  {
    question: "How long does shipping take?",
    answer: "Standard shipping typically takes 3-5 business days. Expedited shipping is available at checkout for 1-2 day delivery.",
  },
  {
    question: "What is your return policy?",
    answer: "We offer a 30-day money-back guarantee on all unopened and unused products. If your item arrives defective, we will replace it free of charge.",
  },
  {
    question: "Do your products come with a warranty?",
    answer: "Yes, all premium gadgets come with a standard 1-year manufacturer warranty covering internal defects.",
  },
  {
    question: "Do you ship internationally?",
    answer: "Currently, we only ship within the contiguous United States and Canada. We are working on expanding our logistics globally!",
  },
];

export default function FAQPage() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-4 sm:px-6 lg:px-8 mt-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-lg text-gray-500">
          Can't find the answer you're looking for? Reach out to our customer support team.
        </p>
      </div>

      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <details 
            key={index} 
            className="group bg-white border border-gray-200 rounded-xl shadow-sm [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex cursor-pointer items-center justify-between p-6 font-medium text-gray-900">
              <span className="text-lg">{faq.question}</span>
              <span className="relative ml-1.5 h-5 w-5 shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute inset-0 h-5 w-5 opacity-100 group-open:opacity-0 transition-opacity"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute inset-0 h-5 w-5 opacity-0 group-open:opacity-100 transition-opacity"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </summary>
            <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
              {faq.answer}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}