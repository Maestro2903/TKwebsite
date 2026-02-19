/**
 * Registration Pass Card Layout Inspector
 * 
 * Run this in browser console on the registration page at 100% zoom
 * with 4-column layout visible (desktop view)
 */

(function inspectPassCards() {
  console.log('='.repeat(80));
  console.log('REGISTRATION PASS CARD LAYOUT INSPECTION');
  console.log('='.repeat(80));
  console.log('\n');

  // Find grid container
  const gridContainer = document.querySelector('[class*="grid"]');
  if (!gridContainer) {
    console.error('Grid container not found');
    return;
  }

  // Find all pass cards
  const cards = document.querySelectorAll('.pass-card-ticket');
  if (cards.length === 0) {
    console.error('No pass cards found');
    return;
  }

  // ========================================
  // SECTION A — Grid Metrics
  // ========================================
  console.log('SECTION A — GRID METRICS');
  console.log('-'.repeat(80));
  
  const gridRect = gridContainer.getBoundingClientRect();
  const gridStyles = window.getComputedStyle(gridContainer);
  
  console.log('Container Width:', gridRect.width.toFixed(2), 'px');
  console.log('Container Max-Width:', gridStyles.maxWidth);
  console.log('Grid Template Columns:', gridStyles.gridTemplateColumns);
  console.log('Grid Gap:', gridStyles.gap || gridStyles.gridGap);
  console.log('Column Gap:', gridStyles.columnGap || gridStyles.gridColumnGap);
  console.log('Row Gap:', gridStyles.rowGap || gridStyles.gridRowGap);
  console.log('Align Items:', gridStyles.alignItems);
  console.log('Align Content:', gridStyles.alignContent);
  console.log('\n');

  // ========================================
  // SECTION B — Card Metrics
  // ========================================
  console.log('SECTION B — CARD METRICS');
  console.log('-'.repeat(80));
  
  cards.forEach((card, index) => {
    const cardRect = card.getBoundingClientRect();
    const cardStyles = window.getComputedStyle(card);
    
    console.log(`\nCard ${index + 1}:`);
    console.log('  Total Width:', cardRect.width.toFixed(2), 'px');
    console.log('  Total Height:', cardRect.height.toFixed(2), 'px');
    
    // Find internal sections
    const header = card.querySelector('.pass-card-ticket__header');
    const contentBlock = card.querySelector('.pass-card-ticket__content, [class*="content"]');
    const buttonSection = card.querySelector('button, [role="button"]');
    
    if (header) {
      const rect = header.getBoundingClientRect();
      const styles = window.getComputedStyle(header);
      console.log('  Header Height:', rect.height.toFixed(2), 'px');
      console.log('  Header Min-Height:', styles.minHeight);
    }
    
    if (contentBlock) {
      const rect = contentBlock.getBoundingClientRect();
      const styles = window.getComputedStyle(contentBlock);
      console.log('  Content Block Height:', rect.height.toFixed(2), 'px');
      console.log('  Content Block Min-Height:', styles.minHeight);
    }
    
    if (buttonSection) {
      const rect = buttonSection.getBoundingClientRect();
      console.log('  Button Section Height:', rect.height.toFixed(2), 'px');
    }
  });
  console.log('\n');

  // ========================================
  // SECTION C — Height Source Breakdown
  // ========================================
  console.log('SECTION C — HEIGHT SOURCE BREAKDOWN');
  console.log('-'.repeat(80));
  
  const firstCard = cards[0];
  const cardStyles = window.getComputedStyle(firstCard);
  
  console.log('Card Wrapper (.pass-card-ticket):');
  console.log('  Height:', cardStyles.height);
  console.log('  Max-Height:', cardStyles.maxHeight);
  console.log('  Min-Height:', cardStyles.minHeight);
  console.log('  Flex:', cardStyles.flex);
  console.log('  Flex-Grow:', cardStyles.flexGrow);
  console.log('  Align-Self:', cardStyles.alignSelf);
  console.log('  Display:', cardStyles.display);
  
  const header = firstCard.querySelector('.pass-card-ticket__header');
  if (header) {
    const headerStyles = window.getComputedStyle(header);
    console.log('\nHeader Area:');
    console.log('  Min-Height:', headerStyles.minHeight);
    console.log('  Height:', headerStyles.height);
    console.log('  Flex:', headerStyles.flex);
    console.log('  Flex-Shrink:', headerStyles.flexShrink);
  }
  console.log('\n');

  // ========================================
  // SECTION D — Stretching/Equalization Rules
  // ========================================
  console.log('SECTION D — STRETCHING OR EQUALIZATION RULES');
  console.log('-'.repeat(80));
  
  console.log('Grid Container:');
  console.log('  Align-Items:', gridStyles.alignItems);
  console.log('  → Cards will', gridStyles.alignItems === 'stretch' ? 'STRETCH' : 'NOT stretch', 'to match row height');
  
  console.log('\nCard Heights (all cards):');
  const heights = Array.from(cards).map(card => card.getBoundingClientRect().height);
  heights.forEach((h, i) => console.log(`  Card ${i + 1}: ${h.toFixed(2)}px`));
  
  const allEqual = heights.every(h => Math.abs(h - heights[0]) < 1);
  console.log('\nAll cards equal height?', allEqual ? 'YES' : 'NO');
  
  if (allEqual) {
    console.log('  → Cards are being equalized');
  } else {
    console.log('  → Height differences detected:');
    const min = Math.min(...heights);
    const max = Math.max(...heights);
    console.log(`     Min: ${min.toFixed(2)}px, Max: ${max.toFixed(2)}px, Diff: ${(max - min).toFixed(2)}px`);
  }
  console.log('\n');

  // ========================================
  // SECTION E — Root Cause Analysis
  // ========================================
  console.log('SECTION E — ROOT CAUSE ANALYSIS');
  console.log('-'.repeat(80));
  
  console.log('Height Control Chain:');
  console.log('  1. Grid container align-items:', gridStyles.alignItems);
  console.log('  2. Card wrapper has h-full?', cardStyles.height === '100%' ? 'YES' : 'NO');
  console.log('  3. Card wrapper max-height:', cardStyles.maxHeight);
  console.log('  4. Card wrapper flex-direction:', cardStyles.flexDirection);
  
  const header2 = firstCard.querySelector('.pass-card-ticket__header');
  if (header2) {
    const headerStyles = window.getComputedStyle(header2);
    console.log('  5. Header min-height:', headerStyles.minHeight);
  }
  
  console.log('\nPotential Issues:');
  
  if (gridStyles.alignItems === 'stretch') {
    console.log('  ⚠ Grid align-items: stretch forces all cards to match tallest card height');
  }
  
  if (cardStyles.height === '100%') {
    console.log('  ⚠ Card wrapper h-full makes it fill grid cell height');
  }
  
  if (header2) {
    const headerRect = header2.getBoundingClientRect();
    const minH = parseInt(window.getComputedStyle(header2).minHeight);
    if (headerRect.height >= minH - 1) {
      console.log(`  ⚠ Header hitting min-height constraint (${minH}px)`);
    }
  }
  
  console.log('\nHeight Determination:');
  if (allEqual && gridStyles.alignItems === 'stretch') {
    console.log('  → Cards are equal because grid stretch + h-full forces equalization');
    console.log('  → Tallest card content dictates height for all cards in row');
  } else {
    console.log('  → Height driven by content and min-height constraints');
  }
  
  console.log('\n');
  console.log('='.repeat(80));
  console.log('INSPECTION COMPLETE');
  console.log('='.repeat(80));
})();
