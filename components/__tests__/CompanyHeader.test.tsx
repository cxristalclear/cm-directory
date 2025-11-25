import React from "react"
import { render, screen } from "@testing-library/react"

import CompanyHeader from "@/components/CompanyHeader"

describe("CompanyHeader", () => {
  it("links to the add company page", () => {
    render(<CompanyHeader />)

    const addCompanyLink = screen.getByRole("link", { name: "Add Your Company" })

    expect(addCompanyLink).toHaveAttribute("href", "/add-your-company")
  })
})
