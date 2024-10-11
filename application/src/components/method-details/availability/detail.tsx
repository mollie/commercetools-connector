import { useApplicationContext } from "@commercetools-frontend/application-shell-connectors";
import SelectField from "@commercetools-uikit/select-field";

const AvailabilityDetail = () => {
  const { dataLocale, projectLanguages } = useApplicationContext((context) => {
    console.log('context', context);
    
    return {
      dataLocale: context.dataLocale ?? '',
      projectLanguages: context.project?.languages ?? [],
    }
  });

  return (
    <>
      <SelectField
        title="Country"
        name="country"
        value={''}
        onChange={(event) => {
          // handleChangeCallback(
          //   event.target.value as string,
          //   formProps.values as TMethodObjectValueFormValues
          // );
        }}
        options={[
          {
            options: [
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' },
            ],
          },
        ]}
        horizontalConstraint={15}
        controlShouldRenderValue={true}
        isSearchable={false}
      ></SelectField>
    </>
  );
}

export default AvailabilityDetail; 