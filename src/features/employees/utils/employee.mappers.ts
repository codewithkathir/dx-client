import type { EmployeeFormValues } from '@/features/employees/schemas/employee.schema';
import type { CreateEmployeePayload, Employee, UpdateEmployeePayload } from '@/types/employee.types';

export function employeeToFormValues(employee: Employee): EmployeeFormValues {
  return {
    empName: employee.empName,
    companyName: employee.companyName,
    dob: employee.dob,
    homeAddress: employee.homeAddress,
    cityState: employee.cityState,
    country: employee.country,
    phoneNo: employee.phoneNo,
    whatsappNo: employee.whatsappNo ?? '',
    emiratesIdNo: employee.emiratesIdNo,
    emiratesIdExpiryDate: employee.emiratesIdExpiryDate,
    visaExpiryDate: employee.visaExpiryDate,
    passportNo: employee.passportNo,
    passportExpiryDate: employee.passportExpiryDate,
    drivingLicenseNo: employee.drivingLicenseNo ?? '',
    drivingLicenseExpiryDate: employee.drivingLicenseExpiryDate ?? '',
    email: employee.email,
    password: '',
    status: employee.status,
    comments: employee.comments ?? '',
    role: employee.role,
  };
}

export function formValuesToCreatePayload(values: EmployeeFormValues): CreateEmployeePayload {
  return {
    empName: values.empName,
    companyName: values.companyName,
    dob: values.dob,
    homeAddress: values.homeAddress,
    cityState: values.cityState,
    country: values.country,
    phoneNo: values.phoneNo,
    whatsappNo: values.whatsappNo || undefined,
    emiratesIdNo: values.emiratesIdNo,
    emiratesIdExpiryDate: values.emiratesIdExpiryDate,
    visaExpiryDate: values.visaExpiryDate,
    passportNo: values.passportNo,
    passportExpiryDate: values.passportExpiryDate,
    drivingLicenseNo: values.drivingLicenseNo || undefined,
    drivingLicenseExpiryDate: values.drivingLicenseExpiryDate || undefined,
    email: values.email,
    password: values.password!,
    status: values.status,
    comments: values.comments || undefined,
    role: values.role || 'employee',
  };
}

export function formValuesToUpdatePayload(values: EmployeeFormValues): UpdateEmployeePayload {
  const payload: UpdateEmployeePayload = {
    empName: values.empName,
    companyName: values.companyName,
    dob: values.dob,
    homeAddress: values.homeAddress,
    cityState: values.cityState,
    country: values.country,
    phoneNo: values.phoneNo,
    whatsappNo: values.whatsappNo || null,
    emiratesIdNo: values.emiratesIdNo,
    emiratesIdExpiryDate: values.emiratesIdExpiryDate,
    visaExpiryDate: values.visaExpiryDate,
    passportNo: values.passportNo,
    passportExpiryDate: values.passportExpiryDate,
    drivingLicenseNo: values.drivingLicenseNo || null,
    drivingLicenseExpiryDate: values.drivingLicenseExpiryDate || null,
    email: values.email,
    status: values.status,
    comments: values.comments || null,
    role: values.role,
  };

  if (values.password) {
    payload.password = values.password;
  }

  return payload;
}
