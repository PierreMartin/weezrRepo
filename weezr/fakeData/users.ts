/* eslint-disable @typescript-eslint/naming-convention */
// eslint-disable-next-line import/no-extraneous-dependencies
import { faker } from '@faker-js/faker';
import { calculateDistance } from "../toolbox/toolbox";
import { IUser } from "../entities";

const data: IUser[] = [];

function randomIntFromInterval(min: number, max: number) {
    let res = Math.random() * (max - min + 1) + min;
    res = parseFloat(res.toFixed(8));

    return res;
}

for (let i = 0; i < 5; i++) {
    const latitude = randomIntFromInterval(35, 40);
    const longitude = randomIntFromInterval(-118, -125);

    const distanceComparedToMe = calculateDistance(
        37.32893832,
        -122.01979684,
        latitude,
        longitude,
        'K'
    );

    data.push({
        roles: ['MEMBER'],
        email: faker.internet.email(),
        displayName: faker.name.findName(),
        isOnline: i % 2 === 0,
        career: {
            job: faker.vehicle.manufacturer(),
            employer: faker.vehicle.manufacturer()
        },
        physicalAppearance: {
            height: 180,
            weight: 65
        },
        password: '1234',
        about: {
            aboutMe: faker.lorem.lines(2),
            relationship: 'single',
            desiredMeetingType: ['friends'],
            spokenLanguages: 'French, English'
        },
        distanceComparedToMe,
        birthAt: faker.date.between('1987-01-01T00:00:00.000Z', '1999-01-01T00:00:00.000Z'),
        account: {
            createdAt: faker.date.between('2020-01-01T00:00:00.000Z', '2022-01-01T00:00:00.000Z'),
            lastLoginAt: faker.date.between('2020-01-01T00:00:00.000Z', '2022-01-01T00:00:00.000Z')
        },
        currentLocation: {
            accuracy: 10,
            latitude,
            longitude,
            timestamp: 1660844093163.6328,
            type: 'Point',
            coordinates: [longitude, latitude]
        },
        gender: 'm',
        poi: ['Tv', 'Sport'],
        images: {
            forwardFileId: (i % 2 === 0) ? 'a81acf6f-a234-41d6-b565-75b8a066cd9e' : '8862d8ca-4c1e-4d74-bc97-a4da48c6e04e',
            list: [
                {
                    fileId: '8862d8ca-4c1e-4d74-bc97-a4da48c6e04e',
                    size_40_40: 'https://app-dating.s3.eu-west-3.amazonaws.com/user/62866700622b4c9f3fac14e5/8862d8ca-4c1e-4d74-bc97-a4da48c6e04e-size_40_40.jpg',
                    size_130_130: 'https://app-dating.s3.eu-west-3.amazonaws.com/user/62866700622b4c9f3fac14e5/8862d8ca-4c1e-4d74-bc97-a4da48c6e04e-size_130_130.jpg',
                    size_320_400: 'https://app-dating.s3.eu-west-3.amazonaws.com/user/62866700622b4c9f3fac14e5/8862d8ca-4c1e-4d74-bc97-a4da48c6e04e-size_320_400.jpg',
                    album: 'public'
                },
                {
                    fileId: 'a81acf6f-a234-41d6-b565-75b8a066cd9e',
                    size_40_40: 'https://app-dating.s3.eu-west-3.amazonaws.com/user/62866700622b4c9f3fac14e5/a81acf6f-a234-41d6-b565-75b8a066cd9e-size_40_40.jpg',
                    size_130_130: 'https://app-dating.s3.eu-west-3.amazonaws.com/user/62866700622b4c9f3fac14e5/a81acf6f-a234-41d6-b565-75b8a066cd9e-size_130_130.jpg',
                    size_320_400: 'https://app-dating.s3.eu-west-3.amazonaws.com/user/62866700622b4c9f3fac14e5/a81acf6f-a234-41d6-b565-75b8a066cd9e-size_320_400.jpg',
                    album: 'public'
                },
                {
                    fileId: 'f602cc99-1706-4fce-ac62-ae9b8c7d5d1e',
                    size_40_40: 'https://app-dating.s3.eu-west-3.amazonaws.com/user/62866700622b4c9f3fac14e5/f602cc99-1706-4fce-ac62-ae9b8c7d5d1e-size_40_40.jpg',
                    size_130_130: 'https://app-dating.s3.eu-west-3.amazonaws.com/user/62866700622b4c9f3fac14e5/f602cc99-1706-4fce-ac62-ae9b8c7d5d1e-size_130_130.jpg',
                    size_320_400: 'https://app-dating.s3.eu-west-3.amazonaws.com/user/62866700622b4c9f3fac14e5/f602cc99-1706-4fce-ac62-ae9b8c7d5d1e-size_320_400.jpg',
                    album: 'public'
                }
            ]
        }
    });
}

export default data;
