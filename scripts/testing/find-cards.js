// Quick diagnostic - what's on the page?
console.log('=== FINDING CARDS ===');
console.log('Looking for .registration-pass-card:', document.querySelectorAll('.registration-pass-card').length);
console.log('Looking for [class*="registration"]:', document.querySelectorAll('[class*="registration"]').length);
console.log('Looking for [class*="pass"]:', document.querySelectorAll('[class*="pass"]').length);
console.log('Looking for article elements:', document.querySelectorAll('article').length);
console.log('Looking for grid containers:', document.querySelectorAll('[class*="grid"]').length);

// Show all elements with "pass" in className
const passElements = document.querySelectorAll('[class*="pass"]');
console.log('\nElements with "pass" in class:');
passElements.forEach((el, i) => {
  console.log(`  ${i + 1}. <${el.tagName.toLowerCase()}> class="${el.className}"`);
});
