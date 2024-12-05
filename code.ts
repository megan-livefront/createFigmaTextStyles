// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

type FontData = {
  size: string;
  lineHeight: string;
  letterSpacing: string;
};

type AllFontData = {
  fontName: string;
  desktopStyles: FontData;
  mobileStyles: FontData;
};

const columnHeaders: AllFontData = {
  fontName: "Headers",
  desktopStyles: {
    size: "Size",
    lineHeight: "Line Height",
    letterSpacing: "Letter Spacing",
  },
  mobileStyles: {
    size: "Size",
    lineHeight: "Line Height",
    letterSpacing: "Letter Spacing",
  },
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
  {
    fontName: "Heading 2",
    desktopStyles: {
      size: "32px",
      lineHeight: "40px",
      letterSpacing: "-0.8px",
    },
    mobileStyles: {
      size: "28px",
      lineHeight: "36px",
      letterSpacing: "-0.8px",
    },
  },
  {
    fontName: "Heading 3",
    desktopStyles: {
      size: "28px",
      lineHeight: "36px",
      letterSpacing: "-0.7px",
    },
    mobileStyles: {
      size: "25px",
      lineHeight: "32px",
      letterSpacing: "-0.7px",
    },
  },
  {
    fontName: "Heading 4",
    desktopStyles: {
      size: "25px",
      lineHeight: "32px",
      letterSpacing: "-0.5px",
    },
    mobileStyles: {
      size: "22px",
      lineHeight: "28px",
      letterSpacing: "-0.5px",
    },
  },
  {
    fontName: "Heading 5",
    desktopStyles: {
      size: "22px",
      lineHeight: "28px",
      letterSpacing: "-0.5px",
    },
    mobileStyles: {
      size: "20px",
      lineHeight: "24px",
      letterSpacing: "-0.5px",
    },
  },
  {
    fontName: "Heading 6",
    desktopStyles: {
      size: "20px",
      lineHeight: "24px",
      letterSpacing: "-0.5px",
    },
    mobileStyles: {
      size: "18px",
      lineHeight: "24px",
      letterSpacing: "-0.5px",
    },
  },
];

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
if (figma.editorType === "figma") {
  const main = async () => {
    const parentFrame = figma.createFrame();
    parentFrame.name = "Text Styles Frame";
    parentFrame.paddingBottom = 90;
    parentFrame.paddingTop = 50;
    parentFrame.paddingLeft = 90;
    parentFrame.paddingRight = 90;
    addAutoLayout(parentFrame, "VERTICAL");
    parentFrame.itemSpacing = 30;

    const headingFrame = await getHeadingFrame();
    parentFrame.appendChild(headingFrame);

    const stylesNode = figma.createFrame();
    stylesNode.name = "All Styles";
    addAutoLayout(stylesNode, "VERTICAL");
    stylesNode.itemSpacing = 25;

    await createTextStyle(columnHeaders, stylesNode);

    for (const fontItem of defaultFontData) {
      await createTextStyle(fontItem, stylesNode); // Waits for each item to finish before moving to the next one
    }

    parentFrame.appendChild(stylesNode);

    parentFrame.x = figma.currentPage.selection[0].x;
    parentFrame.y = figma.currentPage.selection[0].y;

    figma.currentPage.appendChild(parentFrame);

    figma.closePlugin();
  };

  main();
}

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
  headingFrame.paddingTop = 40;
  headingFrame.paddingBottom = 40;
  addAutoLayout(headingFrame, "HORIZONTAL");
  const headingTextNode = figma.createText();
  const columnFont: FontName = { family: "Inter", style: "Bold" };
  const regularFont: FontName = { family: "Inter", style: "Regular" };
  await figma.loadFontAsync(columnFont);
  await figma.loadFontAsync(regularFont);
  headingTextNode.characters = "Text Styles";
  headingTextNode.fontSize = 50;
  headingTextNode.fontName = columnFont;
  headingFrame.appendChild(headingTextNode);

  return headingFrame;
}

function getTextStyleNode(fontName: string) {
  const textStyleNode = figma.createFrame();
  textStyleNode.name = `${fontName} Text Styles`;
  addAutoLayout(textStyleNode, "HORIZONTAL");
  textStyleNode.itemSpacing = 50;

  return textStyleNode;
}

async function createTextStyle(fontItem: AllFontData, stylesNode: FrameNode) {
  const { fontName, desktopStyles, mobileStyles } = fontItem;
  const textStyleNode = getTextStyleNode(fontName);

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
}

async function updateBreakpointMainHeader(
  mainHeader: TextNode,
  breakpoint: "Desktop" | "Mobile"
) {
  const columnFont: FontName = { family: "Inter", style: "Bold" };
  mainHeader.characters = breakpoint;
  mainHeader.fontSize = 20;
  mainHeader.fontName = columnFont;
}

async function updateColumnHeaders(columnHeaders: TextNode[]) {
  const columnFont: FontName = { family: "Inter", style: "Bold" };
  columnHeaders.forEach((header) => {
    header.fontName = columnFont;
    header.characters = header.characters.toUpperCase();
    header.fontSize = 8;
  });
}

async function getBreakpointStyleNode(
  breakpoint: "Desktop" | "Mobile",
  data: FontData,
  fontName: string
) {
  const isHeaderNode = fontName === "Headers";

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
  if (isHeaderNode)
    await updateBreakpointMainHeader(breakpointFontNameText, breakpoint);
  else {
    breakpointFontNameText.characters = fontName;
    breakpointFontNameText.fontSize = parseInt(data.size);
  }
  breakpointFontNameText.lineHeight = {
    value: isHeaderNode ? 28 : parseInt(data.lineHeight),
    unit: "PIXELS",
  };
  breakpointFontNameText.letterSpacing = {
    value: isHeaderNode ? -0.8 : parseInt(data.letterSpacing),
    unit: "PIXELS",
  };
  breakpointFontName.appendChild(breakpointFontNameText);
  breakpointStyleNode.appendChild(breakpointFontName);

  // font data frame
  const breakpointFontData = figma.createFrame();
  addAutoLayout(breakpointFontData, "HORIZONTAL");
  breakpointFontData.itemSpacing = 10;
  // font size
  const breakpointFontSize = figma.createText();
  breakpointFontSize.characters = data.size;
  breakpointFontSize.fontSize = 20;
  breakpointFontSize.resize(90, breakpointFontSize.height);
  // line height
  const breakpointLineHeight = figma.createText();
  breakpointLineHeight.characters = data.lineHeight;
  breakpointLineHeight.fontSize = 20;
  breakpointLineHeight.resize(90, breakpointLineHeight.height);
  // letter spacing
  const breakpointLetterSpacing = figma.createText();
  breakpointLetterSpacing.characters = data.letterSpacing;
  breakpointLetterSpacing.fontSize = 20;
  breakpointLetterSpacing.resize(90, breakpointLetterSpacing.height);

  if (isHeaderNode)
    await updateColumnHeaders([
      breakpointFontSize,
      breakpointLineHeight,
      breakpointLetterSpacing,
    ]);
  breakpointFontData.appendChild(breakpointFontSize);
  breakpointFontData.appendChild(breakpointLineHeight);
  breakpointFontData.appendChild(breakpointLetterSpacing);

  breakpointStyleNode.appendChild(breakpointFontData);

  return breakpointStyleNode;
}
