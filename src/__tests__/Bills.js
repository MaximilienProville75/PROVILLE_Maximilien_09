/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });
});
describe("When I click Icon", () => {
  test("Then Modal should render", () => {
    const ui = BillsUI({ data: bills });
    document.body.innerHTML = ui;
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES_PATH({ pathname });
    };
    const myBill = new Bills({
      document,
      onNavigate,
      store: store,
      localStorage: window.localStorage,
    });
    $.fn.modal = jest.fn().mockImplementation(() => {
      $("#modaleFile").css("display", "block");
    });

    const spy = jest.spyOn(myBill, "handleClickIconEye");
    const icon = document.querySelector(`[data-testid="icon-eye"]`);
    userEvent.click(icon);

    const modal = document.getElementById("modaleFile");
    expect(spy).toHaveBeenCalled();
    expect(modal.style.display).toBe("block");
    const imgWidth = Math.floor($("#modaleFile").width() * 0.5);
    const billUrl =
      "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&amp;token=c1640e12-a24b-4b11-ae52-529112e9602a";
    const modalHtml = document
      .querySelector(".modal-body")
      .querySelector("div").innerHTML;
    expect(modalHtml).toBe(
      `<img width="${imgWidth}" src="${billUrl}\" alt="Bill">`
    );
  });
});

describe("When I navigate to Bills Page", () => {
  test("Then Loading page should have been called", () => {
    const UI = BillsUI({ data: [], loading: true, error: false });
    expect(UI).toBe(LoadingPage());
  });
  test("then Error page should have been called on error", () => {
    const Ui = BillsUI({ data: [], loading: false, error: "ErrorMessage" });
    expect(Ui).toBe(ErrorPage("ErrorMessage"));
  });
});
