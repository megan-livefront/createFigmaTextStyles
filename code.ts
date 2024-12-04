// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// This shows the HTML page in "ui.html".
figma.showUI(__html__);

type AllFontData = {
  fontName: string;
  desktopStyles: FontData;
  mobileStyles: FontData;
};

type FontData = {
  size: string;
  lineHeight: string;
  letterSpacing: string;
};

const defaultFontData: AllFontData[] = [
  {
    fontName: "Hero",
    desktopStyles: {
      size: "51px",
      lineHeight: "72px",
      letterSpacing: "-0.8px",
    },
    mobileStyles: {
      size: "36px",
      lineHeight: "48px",
      letterSpacing: "-0.8px",
    },
  },
  {
    fontName: "Heading 1",
    desktopStyles: {
      size: "36px",
      lineHeight: "48px",
      letterSpacing: "-0.8px",
    },
    mobileStyles: {
      size: "32px",
      lineHeight: "40px",
      letterSpacing: "-0.8px",
    },
  },
];

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = async (msg: { type: string; count: number }) => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.
  if (msg.type === "create-shapes") {
    const parentFrame = figma.createFrame();
    parentFrame.name = "Text Styles Frame";
    addAutoLayout(parentFrame, "VERTICAL");
    parentFrame.itemSpacing = 30;

    const headingFrame = await getHeadingFrame();
    parentFrame.appendChild(headingFrame);

    const stylesNode = figma.createFrame();
    stylesNode.name = "All Styles";
    addAutoLayout(stylesNode, "VERTICAL");

    const createTextStyle = async (fontItem: AllFontData) => {
      const { fontName, desktopStyles, mobileStyles } = fontItem;
      const textStyleNode = await getTextStyleNode(fontName);

      const desktopStyleNode = await getBreakpointStyleNode(
        "Desktop",
        desktopStyles,
        fontName
      );
      const mobileStyleNode = await getBreakpointStyleNode(
        "Mobile",
        mobileStyles,
        fontName
      );

      textStyleNode.appendChild(desktopStyleNode);
      textStyleNode.appendChild(mobileStyleNode);
      stylesNode.appendChild(textStyleNode);
    };

    for (const fontItem of defaultFontData) {
      await createTextStyle(fontItem); // Waits for each item to finish before moving to the next one
    }

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
  frame.counterAxisAlignItems = "CENTER"; // Align items to the start of the cross axis
  frame.layoutSizingHorizontal = "HUG";
  frame.layoutSizingVertical = "HUG";
}

async function getHeadingFrame() {
  const headingFrame = figma.createFrame();
  headingFrame.name = "Text Styles Heading";
  addAutoLayout(headingFrame, "HORIZONTAL");
  const headingTextNode = figma.createText();
  await figma.loadFontAsync(headingTextNode.fontName as FontName);
  headingTextNode.characters = "Text Styles";
  headingFrame.appendChild(headingTextNode);

  return headingFrame;
}

async function getTextStyleNode(fontName: string) {
  const textStyleNode = figma.createFrame();
  textStyleNode.name = `${fontName} Text Styles`;
  addAutoLayout(textStyleNode, "HORIZONTAL");
  textStyleNode.itemSpacing = 50;

  return textStyleNode;
}

async function getBreakpointStyleNode(
  breakpoint: "Desktop" | "Mobile",
  data: FontData,
  fontName: string
) {
  // Frame that holds the font name and the font data
  const breakpointStyleNode = figma.createFrame();
  breakpointStyleNode.name = `${breakpoint} ${fontName} Styles`;
  addAutoLayout(breakpointStyleNode, "HORIZONTAL");
  breakpointStyleNode.resize(650, breakpointStyleNode.height);

  // font name frame
  const breakpointFontName = figma.createFrame();
  addAutoLayout(breakpointFontName, "HORIZONTAL");
  breakpointFontName.resize(190, breakpointFontName.height);
  const breakpointFontNameText = figma.createText();
  await figma.loadFontAsync(breakpointFontNameText.fontName as FontName);
  breakpointFontNameText.characters = fontName;
  breakpointFontNameText.fontSize = parseInt(data.size);
  breakpointFontNameText.lineHeight = {
    value: parseInt(data.lineHeight),
    unit: "PIXELS",
  };
  breakpointFontNameText.letterSpacing = {
    value: parseInt(data.letterSpacing),
    unit: "PIXELS",
  };
  breakpointFontName.appendChild(breakpointFontNameText);
  breakpointStyleNode.appendChild(breakpointFontName);

  // font data frame
  const breakpointFontData = figma.createFrame();
  addAutoLayout(breakpointFontData, "HORIZONTAL");
  breakpointFontData.itemSpacing = 50;
  const breakpointFontSize = figma.createText();
  await figma.loadFontAsync(breakpointFontSize.fontName as FontName);
  breakpointFontSize.characters = data.size;
  breakpointFontData.appendChild(breakpointFontSize);
  const breakpointLineHeight = figma.createText();
  await figma.loadFontAsync(breakpointLineHeight.fontName as FontName);
  breakpointLineHeight.characters = data.lineHeight;
  breakpointFontData.appendChild(breakpointLineHeight);
  const breakpointLetterSpacing = figma.createText();
  await figma.loadFontAsync(breakpointLetterSpacing.fontName as FontName);
  breakpointLetterSpacing.characters = data.letterSpacing;
  breakpointFontData.appendChild(breakpointLetterSpacing);
  breakpointStyleNode.appendChild(breakpointFontData);

  return breakpointStyleNode;
}
