import * as Yup from 'yup';

export const addressField = Yup.string()
  .trim()
  .required('address is required');

export const landAreaField = Yup.number()
  .typeError('land_area_m2 must be a number')
  .required('land_area_m2 is required');

export const realestateURLField = Yup.string()
  .url('realestate_url must be a valid URL')
  .required('realestate_url is required');

export const imageURLField = Yup.string()
    .url('image_url must be a valid URL')
    .required('image_url is required');

export const propertyIDField = Yup.number()
  .typeError('property_id must be a number')
  .required('property_id is required');

export const pageNumberField = Yup.number()
  .typeError('page_no must be a number')
  .required('page_no is required');

export const cv_date_textField = Yup.string()
.trim()
.required('cv date is required');

export const cv_value_textField = Yup.string()
.trim()
.required('cv value is required');

export const cv_valuetField = Yup.number()
.typeError('cv value must be a number')
.required('cv value is required');

export const pricingMethodField = Yup.mixed()
  .required('pricing_method is required');
