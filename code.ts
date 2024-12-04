// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// This shows the HTML page in "ui.html".
figma.showUI(__html__);

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = async (msg: { type: string; count: number }) => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.
  if (msg.type === "create-shapes") {
    const parentFrame = figma.createFrame();
    parentFrame.name = "Text Styles Frame";
    // parentFrame.resize(1000, 1000);
    addAutoLayout(parentFrame, "VERTICAL");

    const headingFrame = figma.createFrame();
    headingFrame.name = "Text Styles Heading";
    addAutoLayout(headingFrame, "HORIZONTAL");
    const headingTextNode = figma.createText();
    await figma.loadFontAsync(headingTextNode.fontName as FontName);
    headingTextNode.characters = "Text Styles";
    headingFrame.appendChild(headingTextNode);

    parentFrame.appendChild(headingFrame);

    const stylesNode = figma.createFrame();
    stylesNode.name = "All Styles";
    addAutoLayout(stylesNode, "VERTICAL");

    const textStyleNode = figma.createFrame();
    textStyleNode.name = "Hero Text Styles";
    addAutoLayout(textStyleNode, "HORIZONTAL");
    stylesNode.appendChild(textStyleNode);

    const desktopStyleNode = figma.createFrame();
    desktopStyleNode.name = "Desktop Hero Styles";
    addAutoLayout(desktopStyleNode, "HORIZONTAL");

    const desktopFontName = figma.createFrame();
    addAutoLayout(desktopFontName, "HORIZONTAL");
    const desktopFontNameText = figma.createText();
    await figma.loadFontAsync(desktopFontNameText.fontName as FontName);
    desktopFontNameText.characters = "Hero";
    desktopFontName.appendChild(desktopFontNameText);
    desktopStyleNode.appendChild(desktopFontName);

    const desktopFontData = figma.createFrame();
    addAutoLayout(desktopFontData, "HORIZONTAL");
    const desktopFontSize = figma.createText();
    await figma.loadFontAsync(desktopFontSize.fontName as FontName);
    desktopFontSize.characters = "51.97px";
    desktopFontData.appendChild(desktopFontSize);
    const desktopLineHeight = figma.createText();
    await figma.loadFontAsync(desktopLineHeight.fontName as FontName);
    desktopLineHeight.characters = "72px";
    desktopFontData.appendChild(desktopLineHeight);
    const desktopLetterSpacing = figma.createText();
    await figma.loadFontAsync(desktopLetterSpacing.fontName as FontName);
    desktopLetterSpacing.characters = "-0.8px";
    desktopFontData.appendChild(desktopLetterSpacing);
    desktopStyleNode.appendChild(desktopFontData);

    textStyleNode.appendChild(desktopStyleNode);
    stylesNode.appendChild(textStyleNode);
    parentFrame.appendChild(stylesNode);

    parentFrame.x = figma.currentPage.selection[0].x;
    parentFrame.y = figma.currentPage.selection[0].y;

    figma.currentPage.appendChild(parentFrame);
  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  figma.closePlugin();
};

function addAutoLayout(frame: FrameNode, direction: "HORIZONTAL" | "VERTICAL") {
  frame.layoutMode = direction; // Set the layout mode to horizontal (can also be 'VERTICAL')
  frame.primaryAxisAlignItems = "MIN"; // Align items to the start of the primary axis
  frame.counterAxisAlignItems = "MIN"; // Align items to the start of the cross axis
  frame.layoutSizingHorizontal = "HUG";
  frame.layoutSizingVertical = "HUG";
  // frame.itemSpacing = 0; // Set the spacing between items in the layout
  // frame.paddingTop = 10; // Set padding for the frame
  // frame.paddingRight = 10;
  // frame.paddingBottom = 10;
  // frame.paddingLeft = 10;
}
