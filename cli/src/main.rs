use clap::Parser;

/// Command-line entry point for the Resident AI service.
#[derive(Debug, Parser)]
#[command(name = "resident-ai", version, about = "CLI for the Resident AI service", long_about = None)]
struct Cli {}

fn main() {
    let _cli = Cli::parse();

    println!(
        "Resident AI CLI scaffold is ready; service commands are not implemented yet."
    );
}
