/**
 * WCAG 2.1 Rules and Guidelines Database
 * Comprehensive collection of accessibility rules for automated testing
 */

import { WCAGRule } from './types';

export const WCAG_RULES: Record<string, WCAGRule> = {
  // Perceivable - Text Alternatives
  '1.1.1': {
    id: '1.1.1',
    name: 'Non-text Content',
    description: 'All non-text content must have text alternatives',
    successCriteria: ['1.1.1'],
    level: 'A',
    guidelines: ['images', 'form controls', 'media'],
    techniques: ['H37', 'H53', 'H45', 'ARIA6'],
    commonFailures: ['F3', 'F13', 'F20', 'F30', 'F38', 'F39', 'F65'],
    relatedRules: ['1.4.5', '1.4.9']
  },

  // Perceivable - Time-based Media
  '1.2.1': {
    id: '1.2.1',
    name: 'Audio-only and Video-only (Prerecorded)',
    description: 'Provide alternatives for time-based media',
    successCriteria: ['1.2.1'],
    level: 'A',
    guidelines: ['audio', 'video', 'transcripts'],
    techniques: ['G158', 'G159', 'H96'],
    commonFailures: ['F8', 'F67'],
    relatedRules: ['1.2.2', '1.2.3']
  },

  '1.2.2': {
    id: '1.2.2',
    name: 'Captions (Prerecorded)',
    description: 'Provide captions for prerecorded audio content',
    successCriteria: ['1.2.2'],
    level: 'A',
    guidelines: ['captions', 'video', 'deaf'],
    techniques: ['G87', 'G93', 'H95'],
    commonFailures: ['F8', 'F74', 'F75'],
    relatedRules: ['1.2.4']
  },

  // Perceivable - Adaptable
  '1.3.1': {
    id: '1.3.1',
    name: 'Info and Relationships',
    description: 'Information and relationships must be programmatically determinable',
    successCriteria: ['1.3.1'],
    level: 'A',
    guidelines: ['structure', 'semantics', 'tables', 'forms'],
    techniques: ['H42', 'H43', 'H44', 'H51', 'H65', 'H73', 'H85', 'H97'],
    commonFailures: ['F2', 'F17', 'F33', 'F34', 'F40', 'F43', 'F46', 'F48', 'F87', 'F90'],
    relatedRules: ['2.4.6', '3.3.2']
  },

  '1.3.2': {
    id: '1.3.2',
    name: 'Meaningful Sequence',
    description: 'Content must have meaningful sequence',
    successCriteria: ['1.3.2'],
    level: 'A',
    guidelines: ['reading-order', 'sequence', 'css'],
    techniques: ['G57', 'C6', 'C8', 'C27', 'F1', 'F32', 'F49'],
    commonFailures: ['F1', 'F32', 'F49'],
    relatedRules: ['1.3.1']
  },

  '1.3.3': {
    id: '1.3.3',
    name: 'Sensory Characteristics',
    description: 'Instructions must not rely solely on sensory characteristics',
    successCriteria: ['1.3.3'],
    level: 'A',
    guidelines: ['instructions', 'sensory'],
    techniques: ['G96', 'G97', 'G130', 'G131'],
    commonFailures: ['F14', 'F26'],
    relatedRules: []
  },

  // Perceivable - Distinguishable
  '1.4.1': {
    id: '1.4.1',
    name: 'Use of Color',
    description: 'Color must not be the only visual means of conveying information',
    successCriteria: ['1.4.1'],
    level: 'A',
    guidelines: ['color', 'contrast', 'visual-cues'],
    techniques: ['G14', 'G15', 'G182', 'G183', 'F13', 'F73', 'F81'],
    commonFailures: ['F13', 'F73', 'F81'],
    relatedRules: ['1.4.3']
  },

  '1.4.2': {
    id: '1.4.2',
    name: 'Audio Control',
    description: 'Provide user control for audio that plays automatically',
    successCriteria: ['1.4.2'],
    level: 'A',
    guidelines: ['audio', 'control', 'autoplay'],
    techniques: ['G60', 'G170', 'G171', 'F23', 'F93'],
    commonFailures: ['F23', 'F93'],
    relatedRules: []
  },

  '1.4.3': {
    id: '1.4.3',
    name: 'Contrast (Minimum)',
    description: 'Text must have sufficient contrast ratio (4.5:1 for normal text, 3:1 for large text)',
    successCriteria: ['1.4.3'],
    level: 'AA',
    guidelines: ['contrast', 'color', 'text'],
    techniques: ['G18', 'G145', 'G174', 'F24', 'F83'],
    commonFailures: ['F24', 'F83'],
    relatedRules: ['1.4.1', '1.4.6']
  },

  '1.4.4': {
    id: '1.4.4',
    name: 'Resize Text',
    description: 'Content must be readable when text is resized to 200%',
    successCriteria: ['1.4.4'],
    level: 'AA',
    guidelines: ['text-resize', 'zoom', 'responsive'],
    techniques: ['G142', 'G146', 'G149', 'G175', 'G178', 'G179', 'H62', 'C12', 'C13', 'C14', 'C15', 'C20', 'C22', 'C28', 'C30', 'SCR34'],
    commonFailures: ['F69', 'F80', 'F94'],
    relatedRules: ['1.4.8']
  },

  '1.4.5': {
    id: '1.4.5',
    name: 'Images of Text',
    description: 'Images of text must be avoided except for decoration or essential',
    successCriteria: ['1.4.5'],
    level: 'AA',
    guidelines: ['images', 'text', 'css'],
    techniques: ['G140', 'C22', 'C30', 'SCR21', 'F3', 'F39', 'F87'],
    commonFailures: ['F3', 'F39', 'F87'],
    relatedRules: ['1.1.1', '1.4.9']
  },

  // Operable - Keyboard Accessible
  '2.1.1': {
    id: '2.1.1',
    name: 'Keyboard',
    description: 'All functionality must be operable through keyboard interface',
    successCriteria: ['2.1.1'],
    level: 'A',
    guidelines: ['keyboard', 'navigation', 'interaction'],
    techniques: ['G90', 'G202', 'SCR2', 'SCR20', 'SLA11', 'F42', 'F54', 'F55'],
    commonFailures: ['F42', 'F54', 'F55'],
    relatedRules: ['2.1.2']
  },

  '2.1.2': {
    id: '2.1.2',
    name: 'No Keyboard Trap',
    description: 'Users must not be trapped in content',
    successCriteria: ['2.1.2'],
    level: 'A',
    guidelines: ['keyboard', 'focus', 'trap'],
    techniques: ['G21', 'SCR20', 'F10'],
    commonFailures: ['F10'],
    relatedRules: ['2.1.1']
  },

  '2.1.4': {
    id: '2.1.4',
    name: 'Character Key Shortcuts',
    description: 'Single character key shortcuts must be configurable or have alternatives',
    successCriteria: ['2.1.4'],
    level: 'A',
    guidelines: ['keyboard', 'shortcuts'],
    techniques: ['G217', 'G219', 'F99'],
    commonFailures: ['F99'],
    relatedRules: []
  },

  // Operable - Enough Time
  '2.2.1': {
    id: '2.2.1',
    name: 'Timing Adjustable',
    description: 'Users must be able to adjust time limits',
    successCriteria: ['2.2.1'],
    level: 'A',
    guidelines: ['time', 'limits', 'control'],
    techniques: ['G133', 'G198', 'G180', 'G181', 'G184', 'SCR1', 'SCR16', 'F40', 'F41', 'F48', 'F58'],
    commonFailures: ['F40', 'F41', 'F48', 'F58'],
    relatedRules: ['2.2.2']
  },

  '2.2.2': {
    id: '2.2.2',
    name: 'Pause, Stop, Hide',
    description: 'Users must be able to pause, stop, or hide moving, blinking, or auto-updating content',
    successCriteria: ['2.2.2'],
    level: 'A',
    guidelines: ['animation', 'control', 'auto-update'],
    techniques: ['G186', 'G191', 'G187', 'G75', 'G76', 'G78', 'G180', 'F16', 'F47', 'F50', 'F51', 'F52'],
    commonFailures: ['F16', 'F47', 'F50', 'F51', 'F52'],
    relatedRules: ['2.2.1']
  },

  // Operable - Seizures and Physical Reactions
  '2.3.1': {
    id: '2.3.1',
    name: 'Three Flashes or Below Threshold',
    description: 'Content must not contain anything that flashes more than three times per second',
    successCriteria: ['2.3.1'],
    level: 'A',
    guidelines: ['flashing', 'seizures'],
    techniques: ['G19', 'G176', 'F16'],
    commonFailures: ['F16'],
    relatedRules: []
  },

  // Operable - Navigable
  '2.4.1': {
    id: '2.4.1',
    name: 'Bypass Blocks',
    description: 'Provide mechanism to bypass blocks of content',
    successCriteria: ['2.4.1'],
    level: 'A',
    guidelines: ['navigation', 'skip-links'],
    techniques: ['G1', 'G123', 'G124', 'H59', 'G125', 'F70', 'F71'],
    commonFailures: ['F70', 'F71'],
    relatedRules: ['2.4.2']
  },

  '2.4.2': {
    id: '2.4.2',
    name: 'Page Titled',
    description: 'Web pages must have descriptive titles',
    successCriteria: ['2.4.2'],
    level: 'A',
    guidelines: ['titles', 'page'],
    techniques: ['G88', 'H25', 'F25'],
    commonFailures: ['F25'],
    relatedRules: ['2.4.1']
  },

  '2.4.3': {
    id: '2.4.3',
    name: 'Focus Order',
    description: 'Focusable components must receive focus in an order that preserves meaning',
    successCriteria: ['2.4.3'],
    level: 'A',
    guidelines: ['focus', 'order', 'navigation'],
    techniques: ['G59', 'H4', 'C27', 'SCR26', 'F44', 'F49'],
    commonFailures: ['F44', 'F49'],
    relatedRules: ['2.4.7']
  },

  '2.4.4': {
    id: '2.4.4',
    name: 'Link Purpose (In Context)',
    description: 'The purpose of each link must be determinable from the link text alone or with context',
    successCriteria: ['2.4.4'],
    level: 'A',
    guidelines: ['links', 'purpose'],
    techniques: ['G91', 'H77', 'H78', 'H79', 'H80', 'H81', 'F63', 'F89'],
    commonFailures: ['F63', 'F89'],
    relatedRules: ['2.4.9']
  },

  '2.4.5': {
    id: '2.4.5',
    name: 'Multiple Ways',
    description: 'Provide multiple ways to locate a Web page within a set of Web pages',
    successCriteria: ['2.4.5'],
    level: 'AA',
    guidelines: ['navigation', 'multiple-ways'],
    techniques: ['G125', 'G126', 'G127', 'G128', 'G161', 'G185'],
    commonFailures: [],
    relatedRules: ['2.4.1']
  },

  '2.4.6': {
    id: '2.4.6',
    name: 'Headings and Labels',
    description: 'Headings and labels must describe topic or purpose',
    successCriteria: ['2.4.6'],
    level: 'AA',
    guidelines: ['headings', 'labels'],
    techniques: ['G130', 'G131', 'H39', 'H42', 'F2', 'F6', 'F32', 'F88'],
    commonFailures: ['F2', 'F6', 'F32', 'F88'],
    relatedRules: ['1.3.1', '3.3.2']
  },

  '2.4.7': {
    id: '2.4.7',
    name: 'Focus Visible',
    description: 'Any keyboard operable user interface must have a mode of operation where keyboard focus indicator is visible',
    successCriteria: ['2.4.7'],
    level: 'AA',
    guidelines: ['focus', 'visible'],
    techniques: ['G149', 'G165', 'G195', 'C15', 'SCR31', 'F55', 'F78'],
    commonFailures: ['F55', 'F78'],
    relatedRules: ['2.4.3']
  },

  // Operable - Input Modalities
  '2.5.1': {
    id: '2.5.1',
    name: 'Pointer Gestures',
    description: 'All functionality that uses multipoint or path-based gestures must be operable with a single pointer',
    successCriteria: ['2.5.1'],
    level: 'A',
    guidelines: ['gestures', 'pointer'],
    techniques: ['G216', 'G215', 'F101'],
    commonFailures: ['F101'],
    relatedRules: []
  },

  '2.5.2': {
    id: '2.5.2',
    name: 'Pointer Cancellation',
    description: 'For functionality that can be operated using a single pointer, completion must be on the up-event',
    successCriteria: ['2.5.2'],
    level: 'A',
    guidelines: ['pointer', 'cancellation'],
    techniques: ['G210', 'G212', 'G217', 'F102'],
    commonFailures: ['F102'],
    relatedRules: []
  },

  '2.5.3': {
    id: '2.5.3',
    name: 'Label in Name',
    description: 'For user interface components with labels, the accessible name must contain the text presented visually',
    successCriteria: ['2.5.3'],
    level: 'A',
    guidelines: ['labels', 'names'],
    techniques: ['G208', 'G211', 'H44', 'H71', 'F96'],
    commonFailures: ['F96'],
    relatedRules: ['2.5.1']
  },

  '2.5.4': {
    id: '2.5.4',
    name: 'Motion Actuation',
    description: 'Functionality that can be operated by motion must also be operable through user interface',
    successCriteria: ['2.5.4'],
    level: 'A',
    guidelines: ['motion', 'control'],
    techniques: ['G213', 'G215', 'F103'],
    commonFailures: ['F103'],
    relatedRules: []
  },

  // Understandable - Readable
  '3.1.1': {
    id: '3.1.1',
    name: 'Language of Page',
    description: 'Default human language of each Web page must be programmatically determinable',
    successCriteria: ['3.1.1'],
    level: 'A',
    guidelines: ['language', 'page'],
    techniques: ['H57', 'F23'],
    commonFailures: ['F23'],
    relatedRules: ['3.1.2']
  },

  '3.1.2': {
    id: '3.1.2',
    name: 'Language of Parts',
    description: 'The human language of each passage or phrase must be programmatically determinable',
    successCriteria: ['3.1.2'],
    level: 'AA',
    guidelines: ['language', 'parts'],
    techniques: ['H58', 'F10'],
    commonFailures: ['F10'],
    relatedRules: ['3.1.1']
  },

  // Understandable - Predictable
  '3.2.1': {
    id: '3.2.1',
    name: 'On Focus',
    description: 'When any component receives focus, it must not initiate a change of context',
    successCriteria: ['3.2.1'],
    level: 'A',
    guidelines: ['focus', 'context'],
    techniques: ['G107', 'G199', 'F55'],
    commonFailures: ['F55'],
    relatedRules: ['3.2.2']
  },

  '3.2.2': {
    id: '3.2.2',
    name: 'On Input',
    description: 'Changing the setting of any user interface component must not automatically cause a change of context',
    successCriteria: ['3.2.2'],
    level: 'A',
    guidelines: ['input', 'context'],
    techniques: ['G80', 'G13', 'G201', 'F36', 'F37'],
    commonFailures: ['F36', 'F37'],
    relatedRules: ['3.2.1']
  },

  '3.2.3': {
    id: '3.2.3',
    name: 'Consistent Navigation',
    description: 'Navigational mechanisms that are repeated on multiple Web pages must occur in the same relative order',
    successCriteria: ['3.2.3'],
    level: 'AA',
    guidelines: ['navigation', 'consistency'],
    techniques: ['G61', 'F66'],
    commonFailures: ['F66'],
    relatedRules: ['3.2.4']
  },

  '3.2.4': {
    id: '3.2.4',
    name: 'Consistent Identification',
    description: 'Components that have the same functionality must be identified consistently',
    successCriteria: ['3.2.4'],
    level: 'AA',
    guidelines: ['identification', 'consistency'],
    techniques: ['G197', 'F31'],
    commonFailures: ['F31'],
    relatedRules: ['3.2.3']
  },

  // Understandable - Input Assistance
  '3.3.1': {
    id: '3.3.1',
    name: 'Error Identification',
    description: 'If an input error is automatically detected, the item in error must be identified and described',
    successCriteria: ['3.3.1'],
    level: 'A',
    guidelines: ['errors', 'identification'],
    techniques: ['G139', 'G199', 'H44', 'H90', 'SCR18', 'F40', 'F89'],
    commonFailures: ['F40', 'F89'],
    relatedRules: ['3.3.3']
  },

  '3.3.2': {
    id: '3.3.2',
    name: 'Labels or Instructions',
    description: 'Labels or instructions must be provided when content requires user input',
    successCriteria: ['3.3.2'],
    level: 'A',
    guidelines: ['labels', 'instructions'],
    techniques: ['G131', 'G184', 'H44', 'H65', 'H90', 'F82', 'F86'],
    commonFailures: ['F82', 'F86'],
    relatedRules: ['1.3.1', '2.4.6']
  },

  '3.3.3': {
    id: '3.3.3',
    name: 'Error Suggestion',
    description: 'If an input error is automatically detected and suggestions for correction are known, they must be provided',
    successCriteria: ['3.3.3'],
    level: 'AA',
    guidelines: ['errors', 'suggestions'],
    techniques: ['G139', 'G84', 'G85', 'G177', 'G199', 'H44', 'H90', 'SCR18', 'F40', 'F89'],
    commonFailures: ['F40', 'F89'],
    relatedRules: ['3.3.1']
  },

  '3.3.4': {
    id: '3.3.4',
    name: 'Error Prevention (Legal, Financial, Data)',
    description: 'For Web pages that cause legal commitments or financial transactions, user must be able to reverse, check, or confirm submissions',
    successCriteria: ['3.3.4'],
    level: 'AA',
    guidelines: ['errors', 'prevention', 'legal'],
    techniques: ['G98', 'G99', 'G155', 'G164', 'G168', 'G199', 'H32'],
    commonFailures: [],
    relatedRules: ['3.3.6']
  },

  '3.3.6': {
    id: '3.3.6',
    name: 'Error Prevention (All)',
    description: 'For Web pages that require user input, user must be able to reverse, check, or confirm submissions',
    successCriteria: ['3.3.6'],
    level: 'AAA',
    guidelines: ['errors', 'prevention'],
    techniques: ['G98', 'G99', 'G155', 'G164', 'G168', 'G199', 'H32'],
    commonFailures: [],
    relatedRules: ['3.3.4']
  },

  // Robust - Compatible
  '4.1.1': {
    id: '4.1.1',
    name: 'Parsing',
    description: 'Content implemented using markup languages must have complete start and end tags, be nested according to specifications',
    successCriteria: ['4.1.1'],
    level: 'A',
    guidelines: ['markup', 'validation'],
    techniques: ['G134', 'G192', 'H74', 'H75', 'H88', 'H93', 'F17', 'F40', 'F70'],
    commonFailures: ['F17', 'F40', 'F70'],
    relatedRules: ['4.1.2']
  },

  '4.1.2': {
    id: '4.1.2',
    name: 'Name, Role, Value',
    description: 'For all user interface components, the name and role must be programmatically determinable',
    successCriteria: ['4.1.2'],
    level: 'A',
    guidelines: ['components', 'name', 'role', 'value'],
    techniques: ['G108', 'G135', 'H44', 'H65', 'H88', 'H91', 'ARIA5', 'ARIA7', 'ARIA16', 'F15', 'F20', 'F59', 'F68', 'F79', 'F89'],
    commonFailures: ['F15', 'F20', 'F59', 'F68', 'F79', 'F89'],
    relatedRules: ['4.1.1']
  }
};

export const WCAG_GUIDELINES = {
  '1.1': 'Text Alternatives: Provide text alternatives for any non-text content',
  '1.2': 'Time-based Media: Provide alternatives for time-based media',
  '1.3': 'Adaptable: Create content that can be presented in different ways',
  '1.4': 'Distinguishable: Make it easier for users to see and hear content',
  '2.1': 'Keyboard Accessible: Make all functionality available from a keyboard',
  '2.2': 'Enough Time: Provide users enough time to read and use content',
  '2.3': 'Seizures and Physical Reactions: Do not design content that causes seizures',
  '2.4': 'Navigable: Provide ways to help users navigate, find content, and determine where they are',
  '2.5': 'Input Modalities: Make it easier for users to operate functionality through various inputs',
  '3.1': 'Readable: Make text content readable and understandable',
  '3.2': 'Predictable: Make Web pages appear and operate in predictable ways',
  '3.3': 'Input Assistance: Help users avoid and correct mistakes',
  '4.1': 'Compatible: Maximize compatibility with current and future user agents'
};

export const WCAG_LEVELS = {
  A: 'Minimum level - essential for accessibility',
  AA: 'Standard level - recommended for most websites',
  AAA: 'Enhanced level - highest level of accessibility'
};

export const getRulesByLevel = (level: 'A' | 'AA' | 'AAA'): WCAGRule[] => {
  return Object.values(WCAG_RULES).filter(rule => rule.level === level);
};

export const getRulesByCategory = (category: string): WCAGRule[] => {
  return Object.values(WCAG_RULES).filter(rule => 
    rule.guidelines.some(guide => guide.toLowerCase().includes(category.toLowerCase()))
  );
};

export const getRulesByGuideline = (guideline: string): WCAGRule[] => {
  return Object.values(WCAG_RULES).filter(rule => 
    rule.successCriteria.some(criteria => criteria.startsWith(guideline))
  );
};

export const getRuleById = (id: string): WCAGRule | undefined => {
  return WCAG_RULES[id];
};

export const getAllRules = (): WCAGRule[] => {
  return Object.values(WCAG_RULES);
};

export const getRequiredRules = (level: 'A' | 'AA' | 'AAA'): WCAGRule[] => {
  const levels = level === 'A' ? ['A'] : level === 'AA' ? ['A', 'AA'] : ['A', 'AA', 'AAA'];
  return Object.values(WCAG_RULES).filter(rule => levels.includes(rule.level));
};