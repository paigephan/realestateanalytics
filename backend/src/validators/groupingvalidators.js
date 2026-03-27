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
    pricingMethodField,
    district, 
    suburb
 } from './commonfields.js';

export const addressLandAreaSchema = Yup.object({
  address: addressField,
  land_area_m2: landAreaField
});

export const newpropertySchema = Yup.object({
    realestate_url: realestateURLField,
    image_url: imageURLField,
    address: addressField,
    land_area_m2: landAreaField,
    district: district,
    suburb: suburb
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

export const selectSuburbSchema = Yup.object({
    listSuburbs: Yup.array()
      .of(Yup.string().trim().min(1))
      .min(1, "At least one suburb is required")
      .max(20, "Too many suburbs selected")
      .required("listSuburbs is required"),
  });


export const searchPropertiesSchema = Yup.object({
    suburbs: Yup.array().of(Yup.string().trim()).default([]),
    districts: Yup.array().of(Yup.string().trim()).default([]),
  
    min_price: Yup.number().min(0).nullable(),
    max_price: Yup.number().min(0).nullable(),
  
    min_area: Yup.number().min(0).nullable(),
    max_area: Yup.number().min(0).nullable(),
  });