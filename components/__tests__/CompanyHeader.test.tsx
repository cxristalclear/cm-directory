import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { computeAccessibleName } from "dom-accessibility-api"

import CompanyHeader from "@/components/CompanyHeader"

describe("CompanyHeader", () => {
  it("navigates to the add company page when the button is clicked", () => {
    const container = document.createElement("div")
    document.body.appendChild(container)

    const root = createRoot(container)
    act(() => {
      root.render(<CompanyHeader />)
    })
    const addCompanyLink = container.querySelector<HTMLAnchorElement>("a[href='/add-your-company']")

    expect(addCompanyLink).not.toBeNull()
    if (!addCompanyLink) {
      throw new Error("Add company link not found")
    }

    expect(computeAccessibleName(addCompanyLink)).toBe("Add Your Company")

    const originalHref = window.location.href
    const originalAnchorClick = HTMLAnchorElement.prototype.click
    HTMLAnchorElement.prototype.click = function clickOverride(this: HTMLAnchorElement) {
      window.history.pushState({}, "", this.href)
    }

    addCompanyLink.click()

    expect(window.location.href).toBe("http://localhost/add-your-company")

    HTMLAnchorElement.prototype.click = originalAnchorClick
    window.history.replaceState({}, "", originalHref)

    act(() => {
      root.unmount()
    })
    container.remove()
  })
})
