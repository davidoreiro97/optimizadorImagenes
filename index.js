import imagemin from "imagemin";
import imageminGifsicle from "imagemin-gifsicle";
import imageminJpegtran from "imagemin-jpegtran";
import imageminSvgo from "imagemin-svgo";
import imageminWebp from "imagemin-webp";
import sharp from "sharp";
import fse from "fs-extra";
import imageminPngquant from "imagemin-pngquant";
import imageminAvif from "imagemin-avif";

let inputFolder = "imagenesSinOptimizar";
let outputFolderImgMin = "imagenesConImgMin";
let outputFolderSharp = "imagenesConSharp";
let outputFolderImgMinYSharp = "imagenesImgMinYSharp";

let widthSelect = 275; //Se podría cambiar para que sea ingresado por el usuario;
let heightSelect = 275;
let calidad = 100; //Se podría pedir para que el usuario ingrese con cuanta calidad lo quiere;

async function crearCarpetas() {
	//Creando carpetas necesarias para las salidas de sharp e imgmin.
	try {
		const existeDirectorio = await fse.pathExists(outputFolderImgMin);
		if (!existeDirectorio) {
			await fse.mkdir(outputFolderImgMin);
			console.log(`Carpeta ${outputFolderImgMin} creada correctamente.`);
		}
	} catch (err) {
		console.error(
			`Error al verificar o crear la carpeta ${outputFolderImgMin}:`,
			err
		);
	}

	try {
		const existeDirectorio = await fse.pathExists(outputFolderSharp);
		if (!existeDirectorio) {
			await fse.mkdir(outputFolderSharp);
			console.log(`Carpeta ${outputFolderSharp} creada correctamente.`);
		}
	} catch (err) {
		console.error(
			`Error al verificar o crear la carpeta ${outputFolderSharp}:`,
			err
		);
	}

	try {
		const existeDirectorio = await fse.pathExists(outputFolderImgMinYSharp);
		if (!existeDirectorio) {
			await fse.mkdir(outputFolderImgMinYSharp);
			console.log(`Carpeta ${outputFolderImgMinYSharp} creada correctamente.`);
		}
	} catch (err) {
		console.error(
			`Error al verificar o crear la carpeta ${outputFolderImgMinYSharp}:`,
			err
		);
	}
}

async function procesarImagenConImageMin() {
	//Usar esta función para bajar la calidad en distintos formatos, ver como aplicar un pluguin u otro a partir de la ext solicitada.
	//Reemplazar el inputFolder si se quiere agarrar las imagens de Sharp y "optimizarlas".
	const dirImagenes = await fse.readdir(inputFolder);
	await crearCarpetas();
	for (const imagen of dirImagenes) {
		let inputPathImg = `${inputFolder}/${imagen}`;
		await imagemin([inputPathImg], {
			destination: outputFolderImgMin,
			plugins: [
				//imageminPngquant({ quality: [10 / 100, 10 / 100] }), //Comprimir imagen PNG con calidad 80(va de 0 a 1 acá).
				//imageminJpegtran(), //Comprimir imagen JPG con calidad deseada
				//imageminWebp({ quality: 100 }), //Comprimir imagen webp con calidad deseada, SI NO SON WEBP GENERA UNA WEBP.
				//imageminSvgo({ quality: 100 }), //Comprimir imagen SVG
				//imageminGifsicle({ quality: 100 }), //Comprimir gifS.
				imageminAvif({ quality: 100 }), //Comprimir avif
			],
		});
	}
}

async function procesarImagenesConSharp(inputFolderArg) {
	//Usar esta función para redimensiones y agregarle lo de transformar a otro formato.
	let outputFolder = outputFolderSharp;
	if (inputFolderArg) {
		inputFolderArg = inputFolderArg;
		outputFolder = outputFolderImgMinYSharp;
	} else {
		inputFolderArg = inputFolder;
		await crearCarpetas(); //Si no hay inputFolderArg significa que no se creo en la otra funcion
	}
	const dirImagenes = await fse.readdir(inputFolderArg);
	let imagenesProcesadas = 0;
	let barraCarga = "";
	const cantImagenes = dirImagenes.length;
	for (const imagen of dirImagenes) {
		let inputPathImg = `${inputFolderArg}/${imagen}`;
		fse.readFile(inputPathImg, async (err, imagenData) => {
			if (err) {
				console.error("Error al leer la imagen.", err);
				return;
			}
			try {
				const imagenSinMetadatos = await sharp(imagenData).toBuffer();
				let imagenNombre =
					imagen.substring(0, imagen.lastIndexOf(".")) + ".avif"; //Cambiar formato acá
				await sharp(imagenSinMetadatos)
					// .resize(widthSelect, heightSelect, {
					// 	fit: "cover", //Permitir elegir estas opciones junto al resize.
					// 	background: "#fff",
					// })
					.toFormat("avif") //Cambiar formato acá, admite avif, jpeg, png, webp
					.toFile(outputFolder + "/" + imagenNombre);
				imagenesProcesadas++;
				barraCarga = "|".repeat(
					parseInt((imagenesProcesadas / cantImagenes) * 100) / 5
				);
				console.log(
					`${barraCarga}${parseFloat(
						(imagenesProcesadas / cantImagenes) * 100
					).toFixed(2)}%`
				);
			} catch (error) {
				console.error("Error al procesar la imagen con sharp.", error);
			}
		});
	}
}
async function procesarImagenesConImageminYSharp() {
	await procesarImagenConImageMin();
	await procesarImagenesConSharp(outputFolderImgMin); //Lo que salio de img min irá a sharp.
}

//async function mainProcesarImagenes() {
//Si quiero cambiar calidad, transformar de un formato a otro y redimensionar: (debo transformar 1°)Sharp 1° y Imagemin 2°
//Si solo quiero optimizar y redimensionar : Imagemin 1° y Sharp 2°
//Si solo quiero redimensionar y transformar de un formato a otro : Sharp
//Si solo quiero cambiar la calidad : imagemin
//procesarImagenConImageMin();
//procesarImagenesConSharp();
// if calidad --> procesarImagenesConImageMin();
// if formato|redimensionar --> procesarImagenesConSharp();
// if calidad+formato|redimensionar --> procesarImagenesConImageminYSharp();
//}
procesarImagenesConSharp();
