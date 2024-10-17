module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            backdropFilter: {
                none: "none",
                blur: "blur(20px)",
            },
            backgroundImage: {
                "gradient-to-t":
                    "linear-gradient(to top, var(--tw-gradient-stops))",
            },
        },
    },
    plugins: [],
};
