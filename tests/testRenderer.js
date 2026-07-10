import { renderClassicGraphic } from "../src/graphics/renderers/classicRenderer.js";

const result = await renderClassicGraphic({
    title: "The Joy of Connection",
    subtitle: "Strong friendships improve health and happiness.",
    footer: "American Seniors"
});

console.log(result);