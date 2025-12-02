/** Sample Tailwind config excerpt for the inventory page tokens.
 * The real project uses `tailwind.config.ts` at the project root,
 * but this file documents the design extensions used for inventory.
 */

module.exports = {
  theme: {
    extend: {
      colors: {
        primary: "#1A73E8",
        "kpi-blue": "#E8F0FE",
        "kpi-green": "#E8F8EF",
        "kpi-yellow": "#FFF8E1",
        "kpi-purple": "#F3E8FF"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(15, 23, 42, 0.08)"
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem"
      }
    }
  }
};


