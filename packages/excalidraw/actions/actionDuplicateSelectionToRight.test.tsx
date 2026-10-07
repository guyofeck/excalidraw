import { getCommonBounds } from "@excalidraw/element";
import { ORIG_ID } from "@excalidraw/common";
import type { Radians } from "@excalidraw/math";

import { Excalidraw } from "../index";
import { API } from "../tests/helpers/api";
import {
  act,
  fireEvent,
  getCloneByOrigId,
  GlobalTestState,
  render,
  screen,
} from "../tests/test-utils";

import { actionDuplicateSelectionToRight } from "./actionDuplicateSelection";

const { h } = window;

describe("duplicate selection to the right", () => {
  beforeEach(async () => {
    await render(<Excalidraw />);
  });

  it.each([0, Math.PI / 4])(
    "duplicates the entire selection with a 20px bounding-box gap (angle %s)",
    (angle) => {
      const first = API.createElement({
        type: "rectangle",
        x: -100,
        y: 40,
        width: 80,
        height: 60,
        angle: angle as Radians,
        groupIds: ["original-group"],
      });
      const second = API.createElement({
        type: "ellipse",
        x: 50,
        y: -20,
        width: 60,
        height: 40,
        groupIds: ["original-group"],
      });
      const unselected = API.createElement({ x: 500, y: 500 });
      API.setElements([first, second, unselected]);
      API.setSelectedElements([first, second]);
      const [minX, minY, maxX] = getCommonBounds([first, second]);

      act(() => {
        h.app.actionManager.executeAction(actionDuplicateSelectionToRight);
      });

      const copies = API.getSelectedElements();
      expect(copies).toHaveLength(2);
      expect(h.elements).toHaveLength(5);
      const [copyMinX, copyMinY] = getCommonBounds(copies);
      expect(copyMinX).toBeCloseTo(maxX + 20);
      expect(copyMinY).toBeCloseTo(minY);
      for (const original of [first, second]) {
        const copy = getCloneByOrigId(original.id);
        expect(copy.x).toBeCloseTo(original.x + maxX - minX + 20);
        expect(copy.y).toBe(original.y);
        expect(copy.id).not.toBe(original.id);
        expect(copy.groupIds).not.toEqual(original.groupIds);
        expect(
          h.elements.find((element) => element.id === original.id),
        ).toEqual(original);
      }
      expect(copies[0].groupIds).toEqual(copies[1].groupIds);
      expect(
        h.elements.find((element) => element.id === unselected.id),
      ).toEqual(unselected);
    },
  );

  it("copies frames and bound text with remapped relationships", () => {
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
    const [minX, , maxX] = getCommonBounds([frame, rectangle, text]);

    act(() => {
      h.app.actionManager.executeAction(actionDuplicateSelectionToRight);
    });

    const frameCopy = getCloneByOrigId(frame.id);
    const rectangleCopy = getCloneByOrigId(rectangle.id);
    const textCopy = getCloneByOrigId(text.id);
    expect(frameCopy.x).toBe(frame.x + maxX - minX + 20);
    expect(rectangleCopy.frameId).toBe(frameCopy.id);
    expect(textCopy.frameId).toBe(frameCopy.id);
    expect(textCopy).toMatchObject({ containerId: rectangleCopy.id });
    expect(rectangleCopy.boundElements).toContainEqual({
      id: textCopy.id,
      type: "text",
    });
    for (const original of [frame, rectangle, text]) {
      expect(getCloneByOrigId(original.id)).toMatchObject({
        [ORIG_ID]: original.id,
        x: original.x + maxX - minX + 20,
        y: original.y,
      });
    }
  });

  it("executes from the context menu and closes it", () => {
    const rectangle = API.createElement({
      x: 50,
      y: 50,
      width: 100,
      height: 80,
    });
    API.setElements([rectangle]);
    API.setSelectedElements([rectangle]);
    fireEvent.contextMenu(GlobalTestState.interactiveCanvas, {
      button: 2,
      clientX: 60,
      clientY: 60,
    });
    fireEvent.click(screen.getByText("Duplicate to the right"));

    expect(h.elements).toHaveLength(2);
    expect(API.getSelectedElement()).toMatchObject({ x: 170, y: 50 });
    expect(API.getSelectedElement().id).not.toBe(rectangle.id);
    expect(screen.queryByText("Duplicate to the right")).toBeNull();
  });

  it("is absent from the empty canvas menu and does nothing without selection", () => {
    fireEvent.contextMenu(GlobalTestState.interactiveCanvas, {
      button: 2,
      clientX: 500,
      clientY: 500,
    });
    expect(screen.queryByText("Duplicate to the right")).toBeNull();
    act(() => {
      h.app.actionManager.executeAction(actionDuplicateSelectionToRight);
    });
    expect(h.elements).toHaveLength(0);
  });
});
