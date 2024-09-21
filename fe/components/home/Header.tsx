import ThemeButton from "../ThemeButton";

export default function Header() {
    return (
        <div className="flex w-full p-10 justify-between">
            <h1>LazyScheduler</h1>
            <ThemeButton/>
        </div>
    )
}