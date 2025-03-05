import React from 'react';
import './plans.css';

const Plans = () => {
  const plans = [
    {
      name: "Free",
      price: "0",
      features: [
        "5 matches per day",
        "Basic messaging",
        "Photo reveal after 5 messages",
        "Basic profile customization"
      ],
      recommended: false
    },
    {
      name: "Premium",
      price: "9.99",
      features: [
        "Unlimited matches",
        "Priority messaging",
        "Photo reveal after 5 messages",
        "Advanced profile customization",
        "See who liked you",
        "Message read receipts"
      ],
      recommended: true
    },
    {
      name: "VIP",
      price: "19.99",
      features: [
        "All Premium features",
        "Priority in search results",
        "Advanced matching algorithm",
        "Profile highlighting",
        "24/7 priority support",
        "Monthly boost included"
      ],
      recommended: false
    }
  ];

  return (
    <div className="plans-container">
      <div className="plans-header">
        <h1>Choose Your Plan</h1>
        <p>Find meaningful connections with our flexible plans</p>
      </div>
      
      <div className="plans-grid">
        {plans.map((plan, index) => (
          <div 
            key={index} 
            className={`plan-card ${plan.recommended ? 'recommended' : ''}`}
          >
            {plan.recommended && (
              <div className="recommended-badge">Most Popular</div>
            )}
            <h2 className="plan-name">{plan.name}</h2>
            <div className="plan-price">
              <span className="currency">$</span>
              <span className="amount">{plan.price}</span>
              <span className="period">/month</span>
            </div>
            <ul className="features-list">
              {plan.features.map((feature, idx) => (
                <li key={idx}>
                  <span className="check-icon">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            <button className={`subscribe-button ${plan.recommended ? 'recommended' : ''}`}>
              Get Started
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Plans;