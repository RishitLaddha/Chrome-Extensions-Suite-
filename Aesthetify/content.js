(function() {
  let isBeautified = false;
  
  // Define selectors to hide on pages that are not Gmail or Canvas.
  const selectorsToHideDefault = [
    '#mw-panel',        // Wikipedia left sidebar
    '#toc',             // Table of contents
    '.navbox',          // Navigation boxes on Wikipedia
    '.reference',       // Reference links on Wikipedia
    '.sidebar',         // Common sidebar class
    '#sidebar',         // Sidebar by ID
    '.sidenav',         // Side navigation menus
    '.advertisement',   // Ads or distracting elements
    '.refbegin'         // Reference section start (if applicable)
  ];
  
  // For Canvas pages we want to leave the sidebar intact.
  const canvasSelectorsToHide = [
    '#mw-panel',
    '#toc',
    '.navbox',
    '.reference',
    '.sidenav',
    '.advertisement',
    '.refbegin'
  ];
  
  // Helper to detect Gmail.
  function isGmail() {
    return window.location.hostname.includes("mail.google.com");
  }
  
  // Helper to detect Canvas. (Assumes Canvas domains include "canvas" or "instructure")
  function isCanvas() {
    return window.location.hostname.includes("canvas") || window.location.hostname.includes("instructure");
  }
  
  // Beautify the page.
  function beautifyPage() {
    if (isBeautified) return;
    
    // Hide distracting elements (use different arrays for Canvas vs. other pages).
    if (isGmail()) {
      // Gmail: do not hide any elements.
    } else if (isCanvas()) {
      canvasSelectorsToHide.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => el.classList.add('aesthetify-hidden'));
      });
    } else {
      selectorsToHideDefault.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => el.classList.add('aesthetify-hidden'));
      });
    }
    
    // Inject custom CSS if not already present.
    if (!document.getElementById('aesthetify-style')) {
      const style = document.createElement('style');
      style.id = 'aesthetify-style';
      
      // Define CSS for three cases: Gmail, Canvas, and Default.
      const gmailCSS = `
          /* Gmail-specific beautification with Courier New font */
          .aesthetified, body {
            font-family: 'Courier New', monospace !important;
            font-size: 16px !important;
            line-height: 1.6 !important;
            color: inherit !important;
          }
          .aesthetified a, body a {
            color: #0066cc !important;
            text-decoration: none !important;
            transition: color 0.3s ease;
          }
          .aesthetified a:hover, body a:hover {
            color: #004a99 !important;
            text-decoration: underline;
          }
          .aesthetified button, body button {
            font-family: 'Courier New', monospace !important;
            font-size: 16px !important;
            border: none !important;
            border-radius: 4px !important;
            padding: 8px 16px !important;
            cursor: pointer !important;
            background-color: #ff5722 !important;
            color: #fff !important;
            transition: background-color 0.3s ease, transform 0.3s ease;
          }
          .aesthetified button:hover, body button:hover {
            background-color: #e64a19 !important;
            transform: scale(1.03);
          }
          /* Formula styling */
          .aesthetified [class*="math"], .aesthetified [class*="formula"],
          body [class*="math"], body [class*="formula"] {
            border: 2px solid #ccc;
            padding: 8px;
            border-radius: 5px;
            background-color: #f9f9f9;
            margin: 1em 0;
          }
      `;
      
      const canvasCSS = `
          /* Canvas-specific beautification with Courier New font */
          .aesthetified, body {
            font-family: 'Courier New', monospace !important;
            font-size: 18px !important;
            line-height: 1.8 !important;
            color: #2c3e50 !important;
          }
          /* Headings with letter-spacing */
          .aesthetified h1, .aesthetified h2, .aesthetified h3,
          .aesthetified h4, .aesthetified h5, .aesthetified h6,
          body h1, body h2, body h3, body h4, body h5, body h6 {
            color: #34495e !important;
            margin-top: 0.8em !important;
            margin-bottom: 0.4em !important;
            letter-spacing: 1px;
          }
          /* Paragraphs with text-shadow */
          .aesthetified p, body p {
            text-align: justify;
            margin-bottom: 1em;
            padding: 2px 0 2px 4px;
            border-left: 2px solid rgba(0,0,0,0.1);
            text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.1);
          }
          /* Blockquotes */
          .aesthetified blockquote, body blockquote {
            font-style: italic;
            border-left: 4px solid #ccc;
            margin: 1em 0;
            padding: 0.5em 1em;
          }
          /* Links */
          .aesthetified a, body a {
            color: #0066cc !important;
            text-decoration: none !important;
            transition: color 0.3s ease, transform 0.3s ease;
          }
          .aesthetified a:hover, body a:hover {
            color: #004a99 !important;
            text-decoration: underline;
            transform: scale(1.02);
          }
          /* Buttons */
          .aesthetified button, body button {
            font-family: 'Courier New', monospace !important;
            font-size: 18px !important;
            border: none !important;
            border-radius: 4px !important;
            padding: 10px 20px !important;
            cursor: pointer !important;
            background-color: #3f51b5 !important;
            color: #fff !important;
            transition: background-color 0.3s ease, transform 0.3s ease;
          }
          .aesthetified button:hover, body button:hover {
            background-color: #303f9f !important;
            transform: scale(1.05);
          }
          /* Sidebar styling: Preserve Canvas sidebar background */
          .aesthetified .sidebar, .aesthetified #sidebar {
            background-color: inherit !important;
          }
          /* Additional elements */
          .aesthetified ul, .aesthetified ol, body ul, body ol {
            margin-left: 1.5em;
            margin-bottom: 1em;
          }
          .aesthetified img, body img {
            max-width: 100%;
            display: block;
            margin: 10px auto;
            border-radius: 5px;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .aesthetified img:hover, body img:hover {
            transform: scale(1.03);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          }
          .aesthetified table, body table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 1em;
          }
          .aesthetified th, .aesthetified td, body th, body td {
            border: 1px solid #ddd;
            padding: 8px;
          }
          .aesthetified tr:nth-child(even), body tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .aesthetified th, body th {
            background-color: #f2f2f2;
            text-align: left;
          }
          .aesthetified pre, .aesthetified code, body pre, body code {
            background: #f5f5f5;
            padding: 5px;
            border-radius: 4px;
          }
          .aesthetified input, .aesthetified textarea, .aesthetified select,
          body input, body textarea, body select {
            font-family: 'Courier New', monospace;
            font-size: 16px;
            padding: 6px 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
            transition: border-color 0.3s ease, box-shadow 0.3s ease;
          }
          .aesthetified input:focus, .aesthetified textarea:focus, .aesthetified select:focus,
          body input:focus, body textarea:focus, body select:focus {
            border-color: #3f51b5;
            box-shadow: 0 0 5px rgba(63,81,181,0.4);
            outline: none;
          }
          .aesthetified hr, body hr {
            border: 0;
            height: 1px;
            background: linear-gradient(to right, rgba(0,0,0,0), rgba(0,0,0,0.3), rgba(0,0,0,0));
            margin: 1.5em 0;
          }
          /* Formula styling */
          .aesthetified [class*="math"], .aesthetified [class*="formula"],
          body [class*="math"], body [class*="formula"] {
            border: 2px solid #888;
            padding: 8px;
            border-radius: 5px;
            background-color: #fcfcfc;
            margin: 1em 0;
          }
      `;
      
      const defaultCSS = `
          /* 1. Base beautification styling for non-Gmail, non-Canvas pages with Courier New font */
          .aesthetified, body {
            font-family: 'Courier New', monospace !important;
            font-size: 18px !important;
            line-height: 1.8 !important;
            color: #2c3e50 !important;
          }
          /* 2. Headings with letter-spacing */
          .aesthetified h1, .aesthetified h2, .aesthetified h3,
          .aesthetified h4, .aesthetified h5, .aesthetified h6,
          body h1, body h2, body h3, body h4, body h5, body h6 {
            color: #34495e !important;
            margin-top: 0.8em !important;
            margin-bottom: 0.4em !important;
            letter-spacing: 1px;
          }
          /* 3. Paragraphs with subtle text-shadow */
          .aesthetified p, body p {
            text-align: justify;
            margin-bottom: 1em;
            padding: 2px 0 2px 4px;
            border-left: 2px solid rgba(0,0,0,0.1);
            text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.1);
          }
          /* 4. Blockquotes styling */
          .aesthetified blockquote, body blockquote {
            font-style: italic;
            border-left: 4px solid #ccc;
            margin: 1em 0;
            padding: 0.5em 1em;
          }
          /* 5. Enhanced link styles with animation */
          .aesthetified a, body a {
            color: #0066cc !important;
            text-decoration: none !important;
            transition: color 0.3s ease, transform 0.3s ease;
          }
          .aesthetified a:hover, body a:hover {
            color: #004a99 !important;
            text-decoration: underline;
            transform: scale(1.02);
          }
          /* 6. Button styling with a new color scheme */
          .aesthetified button, body button {
            font-family: 'Courier New', monospace !important;
            font-size: 18px !important;
            border: none !important;
            border-radius: 4px !important;
            padding: 10px 20px !important;
            cursor: pointer !important;
            background-color: #3f51b5 !important;
            color: #fff !important;
            transition: background-color 0.3s ease, transform 0.3s ease;
          }
          .aesthetified button:hover, body button:hover {
            background-color: #303f9f !important;
            transform: scale(1.05);
          }
          /* 7. List styling */
          .aesthetified ul, .aesthetified ol, body ul, body ol {
            margin-left: 1.5em;
            margin-bottom: 1em;
          }
          /* 8. Images styling with hover effect */
          .aesthetified img, body img {
            max-width: 100%;
            display: block;
            margin: 10px auto;
            border-radius: 5px;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .aesthetified img:hover, body img:hover {
            transform: scale(1.03);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          }
          /* 9. Table styling */
          .aesthetified table, body table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 1em;
          }
          .aesthetified th, .aesthetified td,
          body th, body td {
            border: 1px solid #ddd;
            padding: 8px;
          }
          .aesthetified tr:nth-child(even), body tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .aesthetified th, body th {
            background-color: #f2f2f2;
            text-align: left;
          }
          /* 10. Code block styling */
          .aesthetified pre, .aesthetified code,
          body pre, body code {
            background: #f5f5f5;
            padding: 5px;
            border-radius: 4px;
          }
          /* 11. Styled form inputs and textareas */
          .aesthetified input, .aesthetified textarea, .aesthetified select,
          body input, body textarea, body select {
            font-family: 'Courier New', monospace;
            font-size: 16px;
            padding: 6px 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
            transition: border-color 0.3s ease, box-shadow 0.3s ease;
          }
          .aesthetified input:focus, .aesthetified textarea:focus, .aesthetified select:focus,
          body input:focus, body textarea:focus, body select:focus {
            border-color: #3f51b5;
            box-shadow: 0 0 5px rgba(63,81,181,0.4);
            outline: none;
          }
          /* 12. Styled horizontal rules */
          .aesthetified hr, body hr {
            border: 0;
            height: 1px;
            background: linear-gradient(to right, rgba(0,0,0,0), rgba(0,0,0,0.3), rgba(0,0,0,0));
            margin: 1.5em 0;
          }
          /* 13. Formula styling */
          .aesthetified [class*="math"], .aesthetified [class*="formula"],
          body [class*="math"], body [class*="formula"] {
            border: 2px solid #888;
            padding: 8px;
            border-radius: 5px;
            background-color: #fcfcfc;
            margin: 1em 0;
          }
      `;
      
      let beautifyCSS;
      if (isGmail()) {
        beautifyCSS = gmailCSS;
      } else if (isCanvas()) {
        beautifyCSS = canvasCSS;
      } else {
        beautifyCSS = defaultCSS;
      }
      
      style.textContent = beautifyCSS;
      document.head.appendChild(style);
    }
    
    // Add the beautified class to the body.
    document.body.classList.add('aesthetified');
    // Apply a zoom of 130%.
    document.body.style.zoom = "130%";
    
    isBeautified = true;
    console.log("Page beautified with 130% zoom, Courier New font, and enhanced styling.");
  }
  
  // Revert back to the original page.
  function revertPage() {
    if (!isBeautified) return;
    
    // Remove hidden classes based on page type.
    if (!isGmail() && !isCanvas()) {
      selectorsToHideDefault.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => el.classList.remove('aesthetify-hidden'));
      });
    } else if (isCanvas()) {
      canvasSelectorsToHide.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => el.classList.remove('aesthetify-hidden'));
      });
    }
    
    // Remove the injected style element.
    const styleEl = document.getElementById('aesthetify-style');
    if (styleEl) {
      styleEl.parentNode.removeChild(styleEl);
    }
    
    // Remove the beautification class and reset zoom.
    document.body.classList.remove('aesthetified');
    document.body.style.zoom = "100%";
    
    isBeautified = false;
    console.log("Page reverted to basic mode.");
  }
  
  // Listen for messages from the extension popup.
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "beautify") {
      beautifyPage();
    } else if (message.action === "basic") {
      revertPage();
    }
  });
})();
