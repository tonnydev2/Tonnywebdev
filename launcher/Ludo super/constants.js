const homegap = 207;
export const positions = [
[
				[50,150],[90,190],[50,190],[90,150]
],
[
				[50 + homegap,150],[90 + homegap,190],[50 + homegap,190],[90 + homegap,150]
],
[
 	[50,150 + homegap],[90,190+ homegap],[50,190+ homegap],[90,150+ homegap]
],
[
				[homegap + 50,150+ homegap],[homegap + 90,190+ homegap],[homegap + 50,190+ homegap],[homegap + 90,150+ homegap]
],
[
		[37,250],[197,137],[150,412],[312,297]
]
];

export const places = {
				homeRed1 : positions[0][0],
				homeRed2 : positions[0][1],
				homeRed3 : positions[0][2],
				homeRed4 : positions[0][3],
					homeGreen1 : positions[1][0],
				homeGreen2 : positions[1][1],
				homeGreen3 : positions[1][2],
				homeGreen4 : positions[1][3],
					homeBlue1 : positions[2][0],
				homeBlue2 : positions[2][1],
				homeBlue3 : positions[2][2],
				homeBlue4 : positions[2][3],
					homeYellow1 : positions[3][0],
				homeYellow2 : positions[3][1],
				homeYellow3 : positions[3][2],
				homeYellow4 : positions[3][3],
				startRed : positions[4][0],
				startGreen: positions[4][1],
				startBlue : positions[4][2],
				startYellow: positions[4][3]
}
