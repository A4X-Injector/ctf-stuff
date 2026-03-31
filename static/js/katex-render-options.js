let katex_render_options = {
  delimiters: [
  {left: '$$', right: '$$', display: true},
  {left: '$', right: '$', display: false},
  {left: '\\(', right: '\\)', display: false},
  {left: '\\[', right: '\\]', display: true}
  ],
  throwOnError : false,
  macros: {
      "\\Fp": "\\mathbb{F}_{p}",
      "\\Fq": "\\mathbb{F}_{q}",
      "\\Fpp": "\\mathbb{F}_{p^2}",
  }
}
