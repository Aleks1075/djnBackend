import Stripe from "stripe";
import { Request, Response } from "express";
import Event, { EventItemType } from "../models/event";
import Registration from "../models/registration";

const STRIPE = new Stripe(process.env.STRIPE_API_KEY as string);
const FRONTEND_URL = process.env.FRONTEND_URL as string;
const STRIPE_ENDPOINT_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string;

const getMyRegistrations = async (req: Request, res: Response) => {
  try {
    const registrations = await Registration.find({ user: req.userId })
      .populate("event")
      .populate("user");

    res.json(registrations);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

type CheckoutSessionRequest = {
  cartItems: {
    eventItemId: string;
    name: string;
    quantity: string;
  }[];
  deliveryDetails: {
    email: string;
    name: string;
    phone: string;
  };
  eventId: string;
};

const stripeWebhookHandler = async (req: Request, res: Response) => {
  let eventStripe;

  try {
    const sig = req.headers["stripe-signature"];
    eventStripe = STRIPE.webhooks.constructEvent(
      req.body,
      sig as string,
      STRIPE_ENDPOINT_SECRET
    );
  } catch (error: any) {
    console.log(error);
    return res.status(400).send(`Webhook error: ${error.message}`);
  }

  if (eventStripe.type === "checkout.session.completed") {
    const registration = await Registration.findById(
      eventStripe.data.object.metadata?.registrationId
    );

    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    registration.totalAmount = eventStripe.data.object.amount_total;
    registration.status = "modtaget (afvent bekræftelse)";

    await registration.save();
  }
  res.status(200).send();
};

const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const checkoutSessionRequest: CheckoutSessionRequest = req.body;

    const event = await Event.findById(checkoutSessionRequest.eventId);

    if (!event) {
      throw new Error("Event not found");
    }

    const newRegistration = new Registration({
      event: event,
      user: req.userId,
      status: "afventer",
      deliveryDetails: checkoutSessionRequest.deliveryDetails,
      cartItems: checkoutSessionRequest.cartItems,
      createdAt: new Date(),
    });

    const lineItems = createLineItems(checkoutSessionRequest, event.eventItems);

    const session = await createSession(
      lineItems,
      newRegistration._id.toString(),
      event._id.toString()
    );

    if (!session.url) {
      return res.status(500).json({ message: "Error creating stripe session" });
    }

    await newRegistration.save();
    res.json({ url: session.url });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.raw.message });
  }
};

const createLineItems = (
  checkoutSessionRequest: CheckoutSessionRequest,
  eventItems: EventItemType[]
) => {
  // 1. foreach cartItem, get the eventItem object
  // (to get the price)
  // 2. foreach cartItem, convert it to a stripe line item
  // 3. return line item array

  const lineItems = checkoutSessionRequest.cartItems.map((cartItem) => {
    const eventItem = eventItems.find(
      (item) => item._id.toString() === cartItem.eventItemId.toString()
    );

    if (!eventItem) {
      throw new Error(`Event item not found: ${cartItem.eventItemId}`);
    }

    const line_item: Stripe.Checkout.SessionCreateParams.LineItem = {
      price_data: {
        currency: "dkk",
        unit_amount: eventItem.price * 100,
        product_data: {
          name: eventItem.name,
        },
      },
      quantity: parseInt(cartItem.quantity),
    };
    return line_item;
  });

  return lineItems;
};

const createSession = async (
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
  registrationId: string,
  eventId: string
) => {
  const sessionData = await STRIPE.checkout.sessions.create({
    line_items: lineItems,
    mode: "payment",
    metadata: {
      registrationId,
      eventId,
    },
    success_url: `${FRONTEND_URL}/registration-status?success=true`,
    cancel_url: `${FRONTEND_URL}/detail/${eventId}?cancelled=true`,
  });

  return sessionData;
};

export default {
  getMyRegistrations,
  createCheckoutSession,
  stripeWebhookHandler,
};
