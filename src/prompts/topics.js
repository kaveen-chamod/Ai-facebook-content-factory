// Purpose: Provides a curated topic pool for the content automation system.
// When a new Facebook post is generated, getRandomTopic() picks a subject
// so each run produces fresh, varied content without manual topic selection.
// TOPICS can also be imported directly by schedulers (e.g. n8n) or generators.

/** 30 high-engagement topics for a US audience aged 65+ */
export const TOPICS = [
  // American History
  'The Apollo 11 moon landing and what it meant for America',
  'Life in small-town America during the 1950s',
  'How the Transcontinental Railroad connected the nation',

  // Nostalgia
  'Saturday morning cartoons from the 1960s',
  'Drive-in movie theaters and why they were so special',
  'Family road trips along historic Route 66',

  // NASA & Space
  "NASA's first space shuttle launch and its legacy",
  'The Hubble Space Telescope and its greatest discoveries',
  'Famous American astronauts who inspired a generation',

  // Nature
  "America's national parks and their natural wonders",
  'The changing colors of autumn leaves across the United States',
  'Wildlife and landscapes of Yellowstone National Park',

  // Health
  'Simple daily habits that support healthy aging',
  'The benefits of staying socially connected in retirement',
  'Gentle exercises that support mobility and balance',

  // Classic TV
  'Iconic TV shows that defined the 1960s and 1970s',
  'Famous variety shows Americans grew up watching',
  'Beloved sitcoms that still make people smile today',

  // Food History
  'How diners became a beloved American tradition',
  'Classic American comfort foods through the decades',
  'The history of neighborhood ice cream parlors in America',

  // Interesting Facts
  'Surprising American inventions that changed everyday life',
  'Little-known facts about famous American landmarks',
  'Records and milestones in American sports history',

  // Animals
  'Stories of heroic service dogs in American history',
  'The bald eagle and its comeback across the United States',
  'How gentle pets bring joy and companionship to older adults',

  // Geography
  'How the Mississippi River shaped American history',
  'The Great Lakes and their importance to the Midwest',
  'Fascinating geography facts about all 50 US states',
];

/**
 * Return one random topic from TOPICS for automated content generation.
 * @returns {string} A randomly selected topic
 */
export function getRandomTopic() {
  const index = Math.floor(Math.random() * TOPICS.length);
  return TOPICS[index];
}
