/* MathJax settings shared by every page.
   Write $...$ inline, $$...$$ for display, and $\ce{CO2 + 2e- -> CO}$ for chemistry. */
window.MathJax = {
  loader: { load: ['[tex]/mhchem'] },
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']],
    packages: { '[+]': ['mhchem'] }
  }
};
