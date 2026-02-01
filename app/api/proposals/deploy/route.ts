import { NextRequest, NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe()
    const body = await request.json()
    const { contact, products, totalAmount, billingCycle, proposalId, coverLetter } = body

    if (!contact || !products || !totalAmount) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Create product name: "FirstName CompanyName Product Package"
    const productNames = products.map((p: any) => p.name).join(" + ")
    const packageName = `${contact.firstName} ${contact.company} - ${productNames}`

    // 1. Create or find customer in Stripe
    let stripeCustomer
    const existingCustomers = await stripe.customers.list({
      email: contact.email,
      limit: 1,
    })

    if (existingCustomers.data.length > 0) {
      stripeCustomer = existingCustomers.data[0]
    } else {
      stripeCustomer = await stripe.customers.create({
        name: `${contact.firstName} ${contact.lastName}`,
        email: contact.email,
        metadata: {
          contact_id: contact.id,
          company: contact.company,
        },
      })
    }

    // 2. Create product in Stripe
    const product = await stripe.products.create({
      name: packageName,
      description: `Proposal ${proposalId} for ${contact.company}. ${coverLetter ? "Cover letter included." : ""}`,
      metadata: {
        proposal_id: proposalId,
        contact_id: contact.id,
        contact_email: contact.email,
        company: contact.company,
        billing_cycle: billingCycle,
      },
    })

    // 3. Create price for the product
    const priceConfig: any = {
      product: product.id,
      unit_amount: totalAmount, // Already in cents
      currency: "usd",
    }

    // Add recurring if not single payment
    if (billingCycle === "monthly") {
      priceConfig.recurring = { interval: "month" }
    } else if (billingCycle === "6-mo") {
      priceConfig.recurring = { interval: "month", interval_count: 6 }
    } else if (billingCycle === "1-year") {
      priceConfig.recurring = { interval: "year" }
    }

    const price = await stripe.prices.create(priceConfig)

    // 4. Create payment link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      metadata: {
        proposal_id: proposalId,
        contact_id: contact.id,
        contact_email: contact.email,
      },
      // Include terms of service consent
      consent_collection: {
        terms_of_service: "required",
      },
      // Redirect after payment
      after_completion: {
        type: "redirect",
        redirect: {
          url: `${process.env.NEXT_PUBLIC_APP_URL || "https://localhost:3000"}/proposals/success?proposal=${proposalId}`,
        },
      },
    })

    // 5. Store proposal in database
    const supabase = await createClient()
    await supabase.from("proposals").insert({
      id: proposalId,
      contact_id: contact.id,
      stripe_product_id: product.id,
      stripe_price_id: price.id,
      stripe_payment_link_id: paymentLink.id,
      stripe_payment_link_url: paymentLink.url,
      total_amount: totalAmount / 100, // Store in dollars
      billing_cycle: billingCycle,
      status: "pending",
      cover_letter: coverLetter,
      products: JSON.stringify(products),
    })

    // 6. Log activity
    await supabase.from("activities").insert({
      contact_id: contact.id,
      type: "AI",
      title: "Proposal Deployed",
      detail: `Payment link created for ${packageName} - $${(totalAmount / 100).toLocaleString()}`,
    })

    return NextResponse.json({
      success: true,
      paymentLink: paymentLink.url,
      proposalId,
      productId: product.id,
      priceId: price.id,
    })
  } catch (error: any) {
    console.error("[v0] Error deploying proposal:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to deploy proposal" },
      { status: 500 }
    )
  }
}
