/* eslint-disable import/no-anonymous-default-export */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // A new feature
        "fix", // A bug fix
        "docs", // Documentation only changes
        "style", // Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
        "refactor", // A code change that neither fixes a bug nor adds a feature
        "perf", // A code change that improves performance
        "test", // Adding missing tests or correcting existing tests
        "chore", // Changes to the build process or auxiliary tools and libraries such as documentation generation
        "revert", // Reverts a previous commit
        "wip", // Work in progress
      ],
    ],
    "subject-min-length": [2, "always", 10],
  },
};
