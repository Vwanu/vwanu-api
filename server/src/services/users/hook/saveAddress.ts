import { BadRequest } from '@feathersjs/errors';
import isAddressValid from '../../../lib/utils/isAddressValid';

export default async (context) => {
  const { data, result } = context;
  const { address } = data;
  if (!address) return context;


  if (!isAddressValid(address)) throw new BadRequest('Address is not valid');

  const { Address, EntityAddress } =
    context.app.get('sequelizeClient').models;
  console.log('EntiryAddress and address model retrieved')


  try {
  const [{ id: addressId }] = await Address.findOrCreate({
    where: {
      StateId: address.state,
      // StreetId: streetId,
      CityId: address.city,
      CountryId: address.country,
    },
  });



    const { id: userId } = result;

    await EntityAddress.findOrCreate({
      where: {
        UserId: userId,
        AddressTypeId: address.addressType,
        AddressId: addressId,
      },
      defaults: {},
    });

  } catch (error) {
    console.log('Error', error)
    throw new BadRequest('Address is not valid');
  }

  return context;
};
