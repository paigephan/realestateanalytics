import * as Yup from 'yup';
import { 
    addressField, 
    landAreaField, 
    realestateURLField, 
    imageURLField, 
    propertyIDField, 
    pageNumberField, 
    cv_date_textField, 
    cv_value_textField, 
    cv_valuetField, 
    pricingMethodField } from './commonfields.js';

export const addressLandAreaSchema = Yup.object({
  address: addressField,
  land_area_m2: landAreaField
});

export const newpropertySchema = Yup.object({
    realestate_url: realestateURLField,
    image_url: imageURLField,
    address: addressField,
    land_area_m2: landAreaField
})

export const propertyURLSchema = Yup.object({
    realestate_url: realestateURLField
})

export const propertyPriceSchema = Yup.object({
    property_id: propertyIDField,
    pricing_method: pricingMethodField
})

export const listingSchema = Yup.object({
    page_no: pageNumberField,
    realestate_url: realestateURLField
})

export const propertyCVSchema = Yup.object({
    cv_date_text: cv_date_textField,
    cv_value_text: cv_value_textField,
    cv_value: cv_valuetField
})

export const selectDistrictSchema = Yup.object({
    listSuburbs: Yup.array()
      .of(Yup.string().trim().min(1))
      .min(1, "At least one suburb is required")
      .max(20, "Too many suburbs selected")
      .required("listSuburbs is required"),
  });

