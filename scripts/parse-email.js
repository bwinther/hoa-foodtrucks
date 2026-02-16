#!/usr/bin/env node
/**
 * Parse HOA food truck email and extract schedule info
 * Run: node parse-email.js "email body text"
 * 
 * Leesa uses this to extract food truck data from forwarded emails
 */

const emailText = process.argv[2] || '';

// Common patterns to look for
const patterns = {
    // Date patterns
    date: /(?:(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+)?(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?,?\s*\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4}/gi,
    
    // Time patterns
    time: /\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)?\s*[-–to]+\s*\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)?/gi,
    
    // URL patterns
    url: /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi,
};

console.log('=== Email Parser ===');
console.log('Input length:', emailText.length);
console.log('');

// Extract dates
const dates = emailText.match(patterns.date) || [];
console.log('Dates found:', dates);

// Extract times
const times = emailText.match(patterns.time) || [];
console.log('Times found:', times);

// Extract URLs
const urls = emailText.match(patterns.url) || [];
console.log('URLs found:', urls);

console.log('');
console.log('=== Raw text preview ===');
console.log(emailText.substring(0, 500));
