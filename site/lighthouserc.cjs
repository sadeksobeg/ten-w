module.exports = {
  ci: {
    collect: {
      url: [
        "http://localhost:3000/en",
        "http://localhost:3000/en/solutions",
        "http://localhost:3000/en/contact",
        "http://localhost:3000/en/case-studies/enterprise-ai-ops",
      ],
      startServerCommand: "npm run start",
      startServerReadyPattern: "Ready",
      startServerReadyTimeout: 120000,
      numberOfRuns: 1,
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.85 }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
