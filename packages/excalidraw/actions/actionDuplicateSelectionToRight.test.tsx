import { getCommonBounds } from "@excalidraw/element";

import type { Radians } from "@excalidraw/math";

import { Excalidraw } from "../index";
import { API } from "../tests/helpers/api";
import { UI } from "../tests/helpers/ui";
import {
  act,
  fireEvent,
  getCloneByOrigId,
  GlobalTestState,
  queryByText,
  render,
} from "../tests/test-utils";

import { actionDuplicateSelectionToRight } from "./actionDuplicateSelection";

const { h } = window;

describe("duplicate selection to the right", () => {
  beforeEach(async () => {
    await render(<Excalidraw />);
  });

  it("copies the selection with a 20px gap, preserving relative positions and selecting copies", () => {
    const rectangle = API.createElement({
      type: "rectangle",
      x: -100,
      y: 50,
      width: 100,
      height: 60,
      angle: (Math.PI / 4) as Radians,
    });
    const ellipse = API.createElement({
      type: "ellipse",
      x: 80,
      y: -20,
      width: 50,
      height: 80,
    });
    API.setElements([rectangle, ellipse]);
    API.setSelectedElements([rectangle, ellipse]);
    const [minX, , maxX] = getCommonBounds(h.elements);

    act(() => {
      h.app.actionManager.executeAction(actionDuplicateSelectionToRight);
    });

    const copies = API.getSelectedElements();
    expect(copies).toHaveLength(2);
    expect(getCommonBounds(copies)[0]).toBeCloseTo(maxX + 20);
    for (const original of [rectangle, ellipse]) {
      const copy = getCloneByOrigId(original.id);
      expect(copy.x).toBeCloseTo(original.x + maxX - minX + 20);
      expect(copy.y).toBe(original.y);
      expect(copy.id).not.toBe(original.id);
      expect(h.state.selectedElementIds[original.id]).toBeFalsy();
    }
    expect(h.elements.find((element) => element.id === rectangle.id)).toEqual(
      rectangle,
    );
  });

  it("preserves frame membership and bound text in the copy", () => {
    const frame = API.createElement({
      type: "frame",
      x: 0,
      y: 0,
      width: 300,
      height: 200,
    });
    const [rectangle, text] = API.createTextContainer({ frameId: frame.id });
    API.setElements([rectangle, text, frame]);
    API.setSelectedElements([frame]);

    act(() => {
      h.app.actionManager.executeAction(actionDuplicateSelectionToRight);
    });

    const frameCopy = getCloneByOrigId(frame.id);
    const rectangleCopy = getCloneByOrigId(rectangle.id);
    const textCopy = getCloneByOrigId(text.id);
    expect(rectangleCopy.frameId).toBe(frameCopy.id);
    expect(textCopy.frameId).toBe(frameCopy.id);
    expect(textCopy).toEqual(
      expect.objectContaining({ containerId: rectangleCopy.id }),
    );
    expect(frameCopy.x).toBe(320);
    expect(rectangleCopy.x - rectangle.x).toBe(320);
    expect(textCopy.x - text.x).toBe(320);
  });

  it("runs from the canvas context menu and closes the menu", () => {
    const rectangle = API.createElement({
      type: "rectangle",
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      backgroundColor: "red",
    });
    API.setElements([rectangle]);
    API.setSelectedElements([rectangle]);
    fireEvent.contextMenu(GlobalTestState.interactiveCanvas, {
      button: 2,
      clientX: 50,
      clientY: 50,
    });
    const menu = UI.queryContextMenu();
    expect(menu).not.toBeNull();
    fireEvent.click(queryByText(menu!, "Duplicate to the right")!);
    expect(UI.queryContextMenu()).toBeNull();
    expect(h.elements).toHaveLength(2);
    expect(API.getSelectedElement().x).toBe(120);
    expect(API.getSelectedElement().y).toBe(0);
  });

  it("does nothing without a selection", () => {
    const rectangle = API.createElement({ type: "rectangle" });
    API.setElements([rectangle]);
    act(() => {
      h.app.actionManager.executeAction(actionDuplicateSelectionToRight);
    });
    expect(h.elements).toHaveLength(1);
  });
});
