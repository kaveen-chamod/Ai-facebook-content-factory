// Purpose: Defines the default visual template structure for the graphics engine.
// This module is intentionally configuration-focused and does not generate images yet.

export const classicTemplate = {
  // The unique name of this template.
  templateName: 'classicTemplate',

  // The width of the canvas in pixels.
  canvasWidth: 1200,

  // The height of the canvas in pixels.
  canvasHeight: 628,

  // The main title text displayed on the graphic.
  title: {
    position: "top-center",
    maxWidth: 900,
    fontSize: 72,
    fontWeight: "bold",
    color: "#FFFFFF"
  },

  // The supporting subtitle text under the main title.
  subtitle: {
    text: 'Engaging content for older adults in the USA',
    position: 'center',
    fontSize: 24,
  },

  // The visual brand element used in the graphic.
  logo: {
    enabled:true,
    position:"bottom-left",
    maxWidth:120,
    opacity:1
  },

  // The footer text shown at the bottom of the graphic.
  footer: {
    text: 'Created with AI',
    position: 'bottom-center',
    fontSize: 18,
  },

  // The color palette used for the design.
  colors: {
    background:"#ffffff",
    title:"#ffffff",
    subtitle:"#ffffff",
    accent:"#FFC107",
    footer:"#ffffff"
  },

  // The font settings for the graphic content.
  fonts: {
    title:"Poppins Bold",
    subtitle:"Poppins Medium",
    body:"Inter"
  },

  // The overlay styling used to improve readability.
  overlay: {
    enabled: true,
    opacity: 0.15,
    color: '#000000',
  },

  // The internal spacing around the content.
  padding: {
    top: 40,
    right: 40,
    bottom: 40,
    left: 40,
  },

  // The border styling around the canvas.
  border: {
    enabled: true,
    width: 4,
    color: '#2F5D50',
  },
};
